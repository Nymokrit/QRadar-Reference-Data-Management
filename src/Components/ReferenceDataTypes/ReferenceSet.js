import React, { Component } from 'react';

import ReferenceMetaData from '../ReferenceMetaData';
import ReferenceDataTable from '../ReferenceDataTable';
import ReferenceDataDependents from '../ReferenceDataDependents';
import * as APIHelper from '../../Store/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import { referenceSetTableColumns } from '../../Definitions/TableColumnDefinitions';
import InputModal from '../InputModal';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';

class ReferenceSet extends Component {
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
        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions.setAddItem, });
    }
    clickDeleteItem() {
        this.deleteItem(this.state.selected);
        this.setState({ selected: [], });
        this.clearSelection();
    }
    clickBulkAddItem() {
        this.setState({ showInputModal: true, modalSave: this.bulkAddItems, modalInputDefinition: EntryDefinitions.setBulkAddItems, });
    }
    clickImportItems() {
        this.setState({ showInputModal: true, modalSave: this.importItems, modalInputDefinition: EntryDefinitions.setImportItems, });
    }

    async importItems(entries) {
        const reader = new FileReader();

        reader.onloadend = () => {
            const text = reader.result;
            const data = {
                bulkAddSeparator: entries.bulkAddSeparator,
                bulkAddData: { value: text, },
            };
            this.bulkAddItems(data);
        };

        reader.readAsText(entries.file.value);
    }

    exportItems() {
        RefDataHelper.download(this.props.name, this.state.allEntries);
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        if (!entry['value'].value) {
            this.props.showError('Cannot add an empty value');
            return;
        }
        this.props.toggleLoading();
        const parsedEntry = { value: entry['value'].value, source: entry['source'].value || RefDataHelper.defaultEntryComment };

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

        for (const value of entries) {
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, value);
            updateData = this.updateData(updateData, { value: value, }, false);
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
        // const regexEntries = new RegExp(entries.bulkAddSeparator.value, 'g');
        this.props.toggleLoading();

        let data = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddSeparator.value) // Remove new lines 
            .split(entries.bulkAddSeparator.value) // split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values
        data = [...new Set(data),]; // remove duplicates
        const newData = data.map(elem => ({ value: elem, id: elem, source: RefDataHelper.defaultEntryComment }));
        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let oldData = this.state.allEntries;
            oldData.push(...newData);
            // remove new duplicate values
            oldData = oldData
                .filter((entry, index, self) =>
                    index === self.findIndex((e) => (
                        e.value === entry.value
                    ))
                );
            this.tableChanged('new', oldData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    updateData(currentState, value, isAdd) {
        let updateData = currentState;
        if (isAdd) {
            const indexOfValue = updateData.findIndex((entry) => (value.value === entry.value));
            // value is not yet in ref set
            if (indexOfValue === -1) updateData.push({ value: value.value, id: value.value, source: value.source });
        }
        else updateData = updateData.filter(e => e.value !== value.value);

        return updateData;
    }

    parseResponseData(response) {
        const data = [];
        if (response.number_of_elements > 0) {
            response.data.forEach(element => {
                if (element.value !== undefined) {
                    element.id = element.value;
                    data.push(element);
                }
            });
        }
        return data;
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
            if (!entry.value) continue;
            let matches = false;
            if (isRegexSearch) matches = entry.value.match(searchText);
            else matches = entry.value.toLowerCase().includes(searchText.toLowerCase());

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
                    typeLabel={'Set'}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <ReferenceDataTable
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        columns={referenceSetTableColumns}
                        addItem={this.clickAddItem}
                        bulkAddItem={this.clickBulkAddItem}
                        importItems={this.clickImportItems}
                        exportItems={this.exportItems}
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



export default ReferenceSet;
