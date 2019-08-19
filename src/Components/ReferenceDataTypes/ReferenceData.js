import React, { Component } from 'react';

import * as RefDataHelper from '../RefDataHelper';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';
import { setTableColumns, mapTableColumns, mapOfSetsTableColumns, mapOfSetsInnerTableColumns, tableTableColumns, tableInnerTableColumns } from '../../Definitions/TableColumnDefinitions';
import * as APIHelper from '../../Store/APIHelper';
import MetaData from '../MetaData';
import DataTable from '../DataTable';
import Dependents from '../Dependents';
import InputModal from '../InputModal';

class ReferenceData extends Component {
    constructor(props, type) {
        super(props);
        this.type = type;
        this.columns = {
            'set': setTableColumns,
            'map': mapTableColumns,
            'map_of_sets': mapOfSetsTableColumns,
            'map_of_setsInner': mapOfSetsInnerTableColumns,
            'table': tableTableColumns,
            'tableInner': tableInnerTableColumns,
        };

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
        this.bulkAddItems = this.bulkAddItems.bind(this);
        this.importItems = this.importItems.bind(this);
        this.exportItems = this.exportItems.bind(this);

        this.clickAddItem = this.clickAddItem.bind(this);
        this.clickDeleteItem = this.clickDeleteItem.bind(this);
        this.clickBulkAddItem = this.clickBulkAddItem.bind(this);
        this.clickImportItems = this.clickImportItems.bind(this);

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

    deleteItem() { };
    bulkAddItems() { };
    importItems() { };
    exportItems() { };

    async addItem(parsedEntry) {
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

    clickAddItem() {
        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions[this.type + 'AddItem'], });
    }

    clickDeleteItem() {
        this.deleteItem(this.state.selected);
        this.setState({ selected: [], });
        this.clearSelection();
    }
    clickBulkAddItem() {
        this.setState({ showInputModal: true, modalSave: this.bulkAddItems, modalInputDefinition: EntryDefinitions[this.type + 'BulkAddItems'], });
    }

    clickImportItems() {
        this.setState({ showInputModal: true, modalSave: this.importItems, modalInputDefinition: EntryDefinitions[this.type + 'ImportItems'], });
    }

    clickAddInnerItem(key) {
        this.setState({ showInputModal: true, modalSave: (e) => this.addInnerItem(key, e), modalInputDefinition: EntryDefinitions[this.type + 'AddInnerItem'], });
    }

    clickDeleteInnerItem(key) {
        this.deleteInnerItem(key, this.state.innerSelected[key.key]);
        const selection = this.state.innerSelected;
        selection[key.key] = [];
        this.setState({ innerSelected: selection, });
        this.clearInnerSelection[key.key]();
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
            const matches = this.testValue(entry, searchText, isRegexSearch);
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
                <MetaData
                    data={this.state.metaData}
                    typeLabel={this.type}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <DataTable
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        columns={this.columns[this.type]}
                        type={this.type}
                        addItem={this.clickAddItem}
                        bulkAddItem={this.clickBulkAddItem}
                        importItems={this.clickImportItems}
                        exportItems={this.exportItems}
                        deleteItem={this.clickDeleteItem}
                        searchText={this.state.searchText}

                        selectionChanged={this.selectionChanged}
                        selectionClearedCallback={(f) => this.clearSelection = f}

                        expandable={['map_of_sets', 'table'].includes(this.type)}
                        extendableColumns={this.columns[this.type + 'Inner']}
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
                    <Dependents
                        dependents={this.state.dependents}
                    />
                    :
                    <div className='loading'></div>
                }
            </React.Fragment>
        );
    }
}

export default ReferenceData;