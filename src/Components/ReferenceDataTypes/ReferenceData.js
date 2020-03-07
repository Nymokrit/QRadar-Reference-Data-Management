import React, { Component } from 'react';

import * as RefDataHelper from '../RefDataHelper';
import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';
import { setTableHeaders, mapTableHeaders, mapOfSetsTableHeaders, mapOfSetsInnerTableHeaders, tableTableHeaders, tableInnerTableHeaders } from '../../Definitions/TableHeaderDefinitions';
import * as APIHelper from '../../Util/APIHelper';
import MetaData from '../MetaData';
import DataTableCarbon from '../DataTableCarbon';
import Dependents from '../Dependents';
import InputModal from '../InputModal';
import { DataTableSkeleton } from 'carbon-components-react';

class ReferenceData extends Component {
    constructor(props, type) {
        super(props);
        this.type = type;
        this.headers = {
            'set': setTableHeaders,
            'map': mapTableHeaders,
            'map_of_sets': mapOfSetsTableHeaders,
            'map_of_setsInner': mapOfSetsInnerTableHeaders,
            'table': tableTableHeaders,
            'tableInner': tableInnerTableHeaders,
        };

        this.state = {
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
        this.innerSelectionChanged = RefDataHelper.innerSelectionChanged.bind(this);

        this.loadData(this.props.api);

    }

    deleteItem() { };
    bulkAddItems() { };
    importItems() { };
    exportItems() { };

    async addItem(parsedEntry) {
        this.props.displayLoadingModal(true);

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, parsedEntry);
        const updateData = this.updateData(this.state.allEntries, parsedEntry, true);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    clickAddItem() {
        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions[this.type + 'AddItem'], });
    }

    clickDeleteItem(selectedRow) {
        this.deleteItem(selectedRow);
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

    clickDeleteInnerItem(outer_key, selectedRows) {
        this.deleteInnerItem(outer_key, selectedRows);
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

        let i = 0;
        for (const entry of allEntries) {
            const matches = this.testValue(entry, searchText, isRegexSearch);
            if (matches) {
                entry['index'] = i++;
                tableData.push(entry);
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
                    closeModal={(e) => this.setState(prevState => ({ showInputModal: !prevState.showInputModal, }))}
                />
                <MetaData
                    data={this.state.metaData}
                    typeLabel={this.type}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                />
                {this.state.loaded ?
                    <DataTableCarbon
                        tableChanged={this.tableChanged}
                        data={this.state.tableData}
                        headers={this.headers[this.type]}
                        type={this.type}
                        addItem={this.clickAddItem}
                        bulkAddItem={this.clickBulkAddItem}
                        importItems={this.clickImportItems}
                        exportItems={this.exportItems}
                        deleteItem={this.clickDeleteItem}
                        searchText={this.state.searchText}

                        expandable={['map_of_sets', 'table',].includes(this.type)}
                        extendableHeaders={this.headers[this.type + 'Inner']}
                        addInnerItem={this.clickAddInnerItem}
                        deleteInnerItem={this.clickDeleteInnerItem}
                        innerSearchText={this.state.innerSearchText}
                        innerSelectionChanged={this.innerSelectionChanged}
                        innerSelectionClearedCallback={(key, f) => this.clearInnerSelection[key] = f}
                    />
                    :
                    <DataTableSkeleton rowCount={Math.min(10, this.props.size + 1 || 1)} columnCount={this.headers[this.type].length} />
                }
                <div className='separator'></div>
                <Dependents dependents={this.state.dependents} loaded={this.state.dependentsLoaded} />
            </React.Fragment>
        );
    }
}

export default ReferenceData;