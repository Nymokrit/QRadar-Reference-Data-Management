import React, { Component } from 'react';

import ReferenceMetaData from '../ReferenceMetaData';
import ReferenceDataTable from '../ReferenceDataTable';
import ReferenceDataDependents from '../ReferenceDataDependents';
import * as APIHelper from '../../Store/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import { referenceTableTableColumns, referenceTableInnerTableColumns } from '../../Definitions/TableColumnDefinitions';
import InputModal from '../InputModal';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';

class ReferenceTable extends Component {
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
        const inners = {};
        if (this.state.metaData) {
            for (const key in this.state.metaData.key_name_types) {
                inners[key] = { label: key, value: '', type: 'text', element_type: this.state.metaData.key_name_types[key], };
            }
        }

        const entryDefinition = { 'outer_key': { label: this.state.metaData.key_label || 'Key', value: '', type: 'text', }, ...inners, source: { label: 'Comment', value: '', }, };

        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: entryDefinition, });
    }

    clickDeleteItem() {
        this.deleteItem(this.state.selected);
        this.setState({ selected: [], });
        this.clearSelection();
    }

    clickAddInnerItem(outer_key) {
        this.setState({ showInputModal: true, modalSave: (e) => this.addInnerItem(outer_key, e), modalInputDefinition: EntryDefinitions.tableAddItem, });
    }

    clickDeleteInnerItem(outer_key) {
        this.deleteInnerItem(outer_key, this.state.innerSelected[outer_key.key]);
        const selection = this.state.innerSelected;
        selection[outer_key.key] = [];
        this.setState({ innerSelected: selection, });
        this.clearInnerSelection[outer_key.key]();
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;
        const outer_key = entry.outer_key.value;
        const source = entry.source.value;

        updateData = this.updateData(updateData, { outer_key: outer_key, values: [], }, true, true);
        this.tableChanged('new', updateData);

        delete entry.outer_key;
        delete entry.source;
        for (const key in entry) {
            // Entries[key] not set === no value for this key needs to be saved
            if (!entry[key].value) continue;
            response = await this.addInnerItem({ key: outer_key, }, { key: { value: key, }, value: { value: entry[key].value, }, source: { value: source, }, }, true);
        }

        this.updateMetaData(response);
        this.props.toggleLoading();
    }
    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const outer_key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
            for (const inner_map of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key, inner_map.key, { value: inner_map.value, });

                if (response.error) this.props.showError(response.message);
                else updateData = this.updateData(updateData, { outer_key: outer_key, }, false, true);
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

    async addInnerItem(key, entries, asSub) {
        if (!asSub) this.props.toggleLoading();
        const outer_key = key.key;
        const inner_key = entries.key.value;
        const value = entries.value.value;
        const source = entries.source.value || RefDataHelper.defaultEntryComment;

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { outer_key: outer_key, inner_key: inner_key, value: value, source: source, });

        const updateData = this.updateData(this.state.allEntries, { outer_key: outer_key, inner_key: inner_key, value: value, source: source, }, true);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.updateMetaData(response);
            this.tableChanged('new', updateData);
        }

        if (asSub) return response;
        this.props.toggleLoading();
    }

    async deleteInnerItem(outer_key, entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const inner_key of entries) {
            const indexOfOuterKey = updateData.findIndex((value) => (value.key === outer_key.key));
            const indexOfInnerKey = updateData[indexOfOuterKey].values.findIndex((value) => value.key === inner_key);
            response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key.key, inner_key, { value: updateData[indexOfOuterKey].values[indexOfInnerKey].value, });

            updateData = this.updateData(updateData, { outer_key: outer_key.key, inner_key: inner_key, }, false, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    /**
     * 
     * @param {Object} updateData The object into which new data should be appended
     * @param {Object} entries The new data to append, usually {outer_key, inner_key, value} or {outer_key, values} with values=[{inner_key, value}]
     * @param {bool} isAdd If the entry should be added or removed
     * @param {bool} isOuterKey If the entry comes from addItem (true) or addInnerItem (false)
     */
    updateData(updateData, entries, isAdd, isOuterKey) {
        if (isOuterKey) {
            if (isAdd) {
                // Check if Key already exists in table
                const indexOfOuterKey = updateData.findIndex((value) => (value.key === entries.outer_key));
                if (indexOfOuterKey === -1) {
                    updateData.push({ key: entries.outer_key, values: entries.values, id: entries.outer_key, });
                } else {
                    // If it already exists we skip it
                    // This method is only used to add outer keys, inner keys are added individually
                    return;
                }
            }
            else updateData = updateData.filter(e => e.key !== entries.outer_key);

        } else {
            const indexOfOuterKey = updateData.findIndex((value) => (value.key === entries.outer_key));
            if (indexOfOuterKey === -1) {
                console.log('Something went wrong, couldn\'t find index of outer key in table when trying to delete inner key');
            } else {
                const indexOfInnerKey = updateData[indexOfOuterKey].values.findIndex((value) => (value.key === entries.inner_key));
                if (isAdd) {
                    // If the inner key is not yet defined for that specific outer key, we can simply add it
                    if (indexOfInnerKey === -1)
                        updateData[indexOfOuterKey].values.push({ outer_key: entries.outer_key, key: entries.inner_key, value: entries.value, id: entries.inner_key, source: entries.source, });
                    else
                        updateData[indexOfInnerKey].values[indexOfInnerKey] = { outer_key: entries.outer_key, key: entries.inner_key, value: entries.value, id: entries.inner_key, source: entries.source, };
                }
                else updateData[indexOfOuterKey].values.splice(indexOfInnerKey, 1);
            }
        }

        return updateData;
    }


    parseResponseData(response) {
        let data = [];
        if (response.number_of_elements > 0) {
            // for each key, append key/id attributes to each value because we will need that in the table operations of the 'inner table'
            for (const key in response.data) {
                for (const inner_key in response.data[key]) {
                    response.data[key][inner_key] = {
                        outer_key: key,
                        key: inner_key,
                        id: inner_key,
                        ...response.data[key][inner_key],
                    };
                }
            }

            data = Object.keys(response.data).map(i => ({ key: i, values: Object.values(response.data[i]), id: i, }));
        }
        return data;
    }

    exportItems() {
        const entries = [];
        // Get a flat map of key/value pairs that we can dump afterwards
        for (const entry of this.state.allEntries) {
            entries.push(...entry.values);
        }
        console.log(entries);
        RefDataHelper.download(this.props.name, entries, true, true);
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
                    typeLabel={'Table'}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <ReferenceDataTable
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        columns={referenceTableTableColumns}
                        addItem={this.clickAddItem}
                        exportItems={this.exportItems}
                        deleteItem={this.clickDeleteItem}
                        searchText={this.state.searchText}

                        selectionChanged={this.selectionChanged}
                        selectionClearedCallback={(f) => this.clearSelection = f}

                        expandable={true}
                        extendableColumns={referenceTableInnerTableColumns}
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



export default ReferenceTable;
