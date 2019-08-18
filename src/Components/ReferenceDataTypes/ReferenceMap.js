import React, { Component } from 'react';

import ReferenceMetaData from '../ReferenceMetaData';
import ReferenceDataTable from '../ReferenceDataTable';
import ReferenceDataDependents from '../ReferenceDataDependents';
import * as RefDataHelper from '../RefDataHelper';
import * as APIHelper from '../../Store/APIHelper';
import { referenceMapTableColumns } from '../../Definitions/TableColumnDefinitions';
import InputModal from '../InputModal';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';

class ReferenceMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: [],
            metaData: {},
            allEntries: [],
            tableData: [],
            loaded: false,
            searchText: '',
            modalInputDefinition: {},
        };

        this.addItem = this.addItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.bulkAddItems = this.bulkAddItems.bind(this);
        this.importItems = this.importItems.bind(this);
        this.exportItems = this.exportItems.bind(this);

        this.clickAddItem = this.clickAddItem.bind(this);
        this.clickDeleteItem = this.clickDeleteItem.bind(this);
        this.clickBulkAddItem = this.clickBulkAddItem.bind(this);
        this.clickImportItems = this.clickImportItems.bind(this);
        this.tableChanged = this.tableChanged.bind(this);


        this.updateMetaData = RefDataHelper.updateMetaData.bind(this);
        this.loadData = RefDataHelper.loadData.bind(this);
        this.loadDependents = RefDataHelper.loadDependents.bind(this);
        this.purgeData = RefDataHelper.purgeData.bind(this);
        this.selectionChanged = RefDataHelper.selectionChanged.bind(this);

        this.loadData(this.props.api);
    }

    clickAddItem() {
        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions.mapAddItem, });
    }
    clickDeleteItem() {
        this.deleteItem(this.state.selected);
        this.setState({ selected: [], });
        this.clearSelection();
    }
    clickBulkAddItem() {
        this.setState({ showInputModal: true, modalSave: this.bulkAddItems, modalInputDefinition: EntryDefinitions.mapBulkAddItems, });
    }

    clickImportItems() {
        this.setState({ showInputModal: true, modalSave: this.importItems, modalInputDefinition: EntryDefinitions.mapImportItems, });
    }

    async importItems(entries) {
        const reader = new FileReader();

        reader.onloadend = () => {
            const text = reader.result;
            const data = {
                bulkAddEntriesSeparator: entries.bulkAddEntriesSeparator,
                bulkAddKeyValueSeparator: entries.bulkAddKeyValueSeparator,
                bulkAddData: { value: text, },
            };
            this.bulkAddItems(data);
        };

        reader.readAsText(entries.file.value);
    }

    exportItems() {
        RefDataHelper.download(this.props.name, this.state.allEntries, true);
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        if (!entry['value'].value || !entry['key'].value) {
            this.props.showError('Cannot add an empty value');
            return;
        }
        this.props.toggleLoading();
        const parsedEntry = { key: entry['key'].value, value: entry['value'].value, source: entry['source'].value || RefDataHelper.defaultEntryComment, };

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, parsedEntry);
        const updateData = this.updateData(this.state.allEntries, parsedEntry, true);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: updateData[keyIndex].value, });
            updateData = this.updateData(updateData, { key: key, }, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    async bulkAddItems(entries) {
        // const regexEntries = new RegExp(entries.bulkAddEntriesSeparator.value, 'g');
        // const regexKeyValue = new RegExp(entries.bulkAddKeyValueSeparator.value, 'g');
        this.props.toggleLoading();

        const pairs = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddEntriesSeparator.value) // Remove new lines 
            .split(entries.bulkAddEntriesSeparator.value)
            .map(value => value.trim())
            .filter(value => value);

        let newData = [];

        const data = {};
        for (const pair of pairs) {
            const [key, value,] = pair.split(entries.bulkAddKeyValueSeparator.value).map(value => value.trim()).filter(x => x);
            data[key] = value;
            newData.push({ key: key, value: value, id: key, source: RefDataHelper.defaultEntryComment, });
        }

        // We remove duplicate keys but keep the newest key=value pair
        // This is be the expected behaviour when duplicate keys are passed to the API so we imitate the same
        newData = newData
            .reverse()
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.key === entry.key
                ))
            )
            .reverse();

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let oldData = this.state.allEntries;
            oldData.push(...newData);
            // remove new duplicate keys and keep the newest ones
            oldData = oldData.reverse()
                .filter((entry, index, self) =>
                    index === self.findIndex((e) => (
                        e.key === entry.key
                    ))
                )
                .reverse();

            this.tableChanged('new', oldData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    updateData(currentState, value, isAdd) {
        let updateData = currentState;
        if (isAdd) updateData.push({ key: value.key, value: value.value, id: value.key, source: value.source, });
        else updateData = updateData.filter(e => e.key !== value.key);

        updateData = updateData
            .reverse()
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.key === entry.key
                ))
            )
            .reverse();

        return updateData;
    }

    parseResponseData(response) {
        const data = [];
        if (response.number_of_elements > 0) {
            for (const key in response.data) {
                if (key !== undefined) {
                    data.push({ key: key, ...response.data[key], id: key, });
                }
            }
            return data;
        }
    }

    tableChanged(type, options) {
        let allEntries = this.state.allEntries;
        let searchText = this.state.searchText;
        if (type === 'search' && options) searchText = options.searchText;
        if (type === 'new' && options) allEntries = options;

        const tableData = [];
        let isRegexSearch = false;
        try { // Check if the current expression can be parsed as regex, if not, we try string matching
            searchText = new RegExp(searchText, 'gi');
            isRegexSearch = true;
        } catch (e) { }

        for (const entry of allEntries) {
            if (!entry.value || !entry.key) continue;

            let matches = false;
            if (isRegexSearch) matches = entry.value.match(searchText) || entry.key.match(searchText);
            else matches = entry.value.toLowerCase().includes(searchText.toLowerCase()) || entry.key.toLowerCase().includes(searchText.toLowerCase());

            if (matches) tableData.push(entry);
        }
        this.setState({ tableData: tableData, searchText: searchText, allEntries: allEntries, });
    }

    render() {
        return (
            <React.Fragment>
                <InputModal
                    modal={this.state.showInputModal}
                    save={this.state.modalSave}
                    entries={JSON.parse(JSON.stringify(this.state.modalInputDefinition))}
                    toggle={(e) => this.setState(prevState => ({ showInputModal: !prevState.showInputModal, }))}
                />
                <ReferenceMetaData
                    data={this.state.metaData}
                    typeLabel={'Map'}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <ReferenceDataTable
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        columns={referenceMapTableColumns}
                        addItem={this.clickAddItem}
                        bulkAddItem={this.clickBulkAddItem}
                        exportItems={this.exportItems}
                        importItems={this.clickImportItems}
                        deleteItem={this.clickDeleteItem}
                        searchText={this.state.searchText}

                        selectionChanged={this.selectionChanged}
                        selectionClearedCallback={(f) => this.clearSelection = f}
                    />
                    :
                    <div className='loading'></div>
                }
                {this.state.dependentsLoaded ?
                    <ReferenceDataDependents
                        dependents={this.state.dependents}
                    />
                    :
                    <div className='loading'></div>
                }
            </React.Fragment>
        );
    }
}



export default ReferenceMap;
