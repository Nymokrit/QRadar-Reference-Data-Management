import React, { Component } from 'react';

import ReferenceMetaData from '../ReferenceMetaData';
import ReferenceDataTable from '../ReferenceDataTable';
import ReferenceDataDependents from '../ReferenceDataDependents';
import * as APIHelper from '../../Store/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import { referenceMapOfSetsTableColumns, referenceMapOfSetsInnerTableColumns } from '../../Definitions/TableColumnDefinitions';
import InputModal from '../InputModal';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';

class ReferenceMapOfSets extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: [],
            innerSelected: {},
            metaData: {},
            allEntries: [],
            tableData: [],
            loaded: false,
            searchText: '',
            innerSearchText: '',
            modalInputDefinition: {},
        };

        this.clearInnerSelection = {};

        this.addItem = this.addItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.exportItems = this.exportItems.bind(this);
        this.clickAddItem = this.clickAddItem.bind(this);
        this.clickDeleteItem = this.clickDeleteItem.bind(this);

        this.clickAddInnerItem = this.clickAddInnerItem.bind(this);
        this.clickDeleteInnerItem = this.clickDeleteInnerItem.bind(this);

        this.tableChanged = this.tableChanged.bind(this);

        this.updateMetaData = RefDataHelper.updateMetaData.bind(this);
        this.loadData = RefDataHelper.loadData.bind(this);
        this.loadDependents = RefDataHelper.loadDependents.bind(this);
        this.purgeData = RefDataHelper.purgeData.bind(this);
        this.selectionChanged = RefDataHelper.selectionChanged.bind(this);
        this.innerSelectionChanged = RefDataHelper.innerSelectionChanged.bind(this);

        this.loadData(this.props.api);
    }

    clickAddItem() {
        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions.mapOfSetsAddKey, });
    }

    clickDeleteItem() {
        this.deleteItem(this.state.selected);
        this.setState({ selected: [], });
        this.clearSelection();
    }

    clickAddInnerItem(key) {
        this.setState({ showInputModal: true, modalSave: (e) => this.addInnerItem(key, e), modalInputDefinition: EntryDefinitions.mapOfSetsAddItem, });
    }

    clickDeleteInnerItem(key) {
        this.deleteInnerItem(key, this.state.innerSelected[key.key]);
        const selection = this.state.innerSelected;
        selection[key.key] = [];
        this.setState({ innerSelected: selection, });
        this.clearInnerSelection[key.key]();
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        const values = entry.keyAddDataValues.value
            .replace(/\r?\n/g, entry.keyAddSeparator.value) // Remove new lines 
            .split(entry.keyAddSeparator.value)// split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values

        const key = entry.keyAddDataKey.value;
        const data = { [key]: values, };

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);
        if (response) {
            const updateData = this.updateData(this.state.allEntries, { key: key, values: values, source: RefDataHelper.defaultEntryComment, }, true, true);
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }

    }
    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.tableData;

        for (const key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            for (const value of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: value.value, });

                // IS this working? That should not work
                updateData = this.updateData(updateData, { key: key, }, false, true);

            }
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    async addInnerItem(key, entry) {
        const parsedEntry = { value: entry['value'].value, key: key.key, source: entry['source'].value || RefDataHelper.defaultEntryComment, };

        const indexOfKey = this.state.allEntries.findIndex((value) => (value.key === key.key));
        if (this.state.allEntries[indexOfKey].values.findIndex((value) => (value.value === entry['value'].value)) !== -1) {
            console.log('Value already in table. Skipping');
            this.props.showError('Value already in table.');
            return;
        }

        this.props.toggleLoading();
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

    async deleteInnerItem(key, entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const value of entries) {
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key.key, { value: value, });
            updateData = this.updateData(updateData, { key: key.key, value: value, }, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }


    updateData(updateData, entries, isAdd, isOuterKey) {
        if (isOuterKey) {
            if (isAdd) {
                // We expect an object {key: key, values: [values]}

                // Check if Key already exists in table
                const indexOfKey = updateData.findIndex((value) => (value.key === entries.key));
                if (indexOfKey === -1) {
                    // if no, we can add all values but we remove duplicates first
                    let values = [...new Set(entries.values),];
                    values = values.map((value) => ({ value: value, id: value, key: entries.key, source: entries.source, }));
                    updateData.push({ key: entries.key, values: values, id: entries.key, });
                } else {
                    // if yes, we need to check each inner value if it already exists
                    for (const value of entries.values) {
                        const indexOfValue = updateData[indexOfKey].values.findIndex((inner) => (inner.value === value));
                        // if no, we can add it to the table
                        if (indexOfValue === -1) updateData[indexOfKey].values.push({ value: value, id: value, key: entries.key, source: entries.source, });
                        // if yes, we skip it
                    }
                }
            }
            // We expect an object {key: key}
            else updateData = updateData.filter(e => e.key !== entries.key);
        } else {
            // We expect an object {key: key} or {key: key, value: value}
            const indexOfKey = updateData.findIndex((value) => (value.key === entries.key));
            if (indexOfKey === -1) {
                // if all goes as expected, that should never happen
                console.log('Something went wrong, couldn\'t find index of outer key in table when trying to delete inner key');
            } else {
                if (isAdd) {
                    updateData[indexOfKey].values.push({ value: entries.value, id: entries.value, key: entries.key, source: entries.source, });
                }
                else updateData[indexOfKey].values = updateData[indexOfKey].values.filter(e => e.value !== entries.value);
            }
        }

        return updateData;
    }


    parseResponseData(response) {
        let data = [];
        if (response.number_of_elements > 0) {
            // for each key, append key/id attributes to each value because we will need that in the table operations of the 'inner table'
            for (const key in response.data) {
                response.data[key] = response.data[key].map(elem => ({
                    key: key,
                    id: elem.value,
                    ...elem,
                }));
            }

            data = Object.keys(response.data).map(i => ({ key: i, values: response.data[i], valueLabel: response.value_label, id: i, }));
        }
        return data;
    }

    exportItems() {
        const entries = [];
        // Get a flat map of key/value pairs that we can dump afterwards
        for (const entry of this.state.allEntries) {
            entries.push(...entry.values);
        }
        RefDataHelper.download(this.props.name, entries, true, false);
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
            let matches = false;
            if (isRegexSearch) matches = entry.key.match(searchText);
            else matches = entry.key.toLowerCase().includes(searchText.toLowerCase());

            // if we found the string as part of a key, we add the entry
            if (matches) tableData.push(entry);
            // if we didn't find the string as key, let's try each value
            else {
                for (const value of entry.values) {
                    if (isRegexSearch) matches = value.value.match(searchText);
                    else matches = value.value.toLowerCase().includes(searchText.toLowerCase());

                    if (matches) {
                        tableData.push(entry);
                        break;
                    }
                }
            }
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
                    typeLabel={'Map of Sets'}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <ReferenceDataTable
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        columns={referenceMapOfSetsTableColumns}
                        addItem={this.clickAddItem}
                        exportItems={this.exportItems}
                        deleteItem={this.clickDeleteItem}
                        searchText={this.state.searchText}

                        selectionChanged={this.selectionChanged}
                        selectionClearedCallback={(f) => this.clearSelection = f}

                        expandable={true}
                        extendableColumns={referenceMapOfSetsInnerTableColumns}
                        addInnerItem={this.clickAddInnerItem}
                        deleteInnerItem={this.clickDeleteInnerItem}
                        innerSearchText={this.state.innerSearchText}
                        innerSelectionChanged={this.innerSelectionChanged}
                        innerSelectionClearedCallback={(key, f) => this.clearInnerSelection[key] = f}
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



export default ReferenceMapOfSets;
