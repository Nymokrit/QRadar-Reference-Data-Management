import React, { Component } from 'react';

import * as EntryDefinitions from '../../Definitions/ReferenceDataCreateEntryDefinitions';
import { setTableHeaders, mapTableHeaders, mapOfSetsTableHeaders, mapOfSetsInnerTableHeaders, tableTableHeaders, tableInnerTableHeaders } from '../../Definitions/TableHeaderDefinitions';
import * as APIHelper from '../../Util/APIHelper';
import fileSaver from 'file-saver';
import { QRadar } from 'qjslib';
import Config from '../../Util/Config';
import MetaData from '../MetaData';
import DataTableCarbon from '../DataTableCarbon';
import Dependents from '../Dependents';
import InputModal from '../InputModal';
import { DataTableSkeleton, Modal } from 'carbon-components-react';

let username;

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
            metaData: {},
            allEntries: [],
            tableData: [],
            loaded: false,
            searchText: '',
            modalInputDefinition: {},
        };

        this.loadData();
    }

    defaultEntryComment = async () => {
        if (username) return username;
        try {
            const entry = await QRadar.getCurrentUser();
            if (entry && !entry.error) username = entry.username;
        } catch (e) { console.log(e); };
        return username;
    }

    updateMetaData = (data) => {
        const metaData = this.state.metaData;
        metaData.number_of_elements = data.number_of_elements;
        this.setState({ metaData: metaData, });
        this.props.dataUpdated();
    }

    loadData = async (reload) => {
        this.loadDependents(); // async load dependents

        let response;
        const stepSize = 5000;
        let numElements = 0;

        let from = 0;
        let to = stepSize;
        while (true) {
            const headers = { Range: `items=${from}-${to}`, };

            response = await APIHelper.loadReferenceDataValues(this.props.type, this.props.name, headers);
            if (response.error) {
                this.props.showError(`Unable to load all elements`);
                this.setState({ loaded: true, });
                return;
            }

            // this.props.size is unknown if the RefData is accessed by URL directly
            // so we only set numElements to a value if we know the definite value for sure
            if (!this.props.size && response.number_of_elements) numElements = response.number_of_elements;

            let data = reload ? [] : this.state.allEntries;
            reload = false;
            // For map of sets and tables, num_of_elements is #outer_key*#inner_keys, hence at some point we load 
            // a range that contains no data. At that point, we skip the rest
            if (response.data) {
                const newData = this.parseResponseData(response);
                if (data) data.push(...newData);
                else data = newData;

                await this.setState({ allEntries: data, });
                delete response.data; // We will use the remaining object for displaying meta data
                this.tableChanged();

                if (numElements && numElements > to) {
                    response.number_of_elements = to + 1;
                    this.setState({ metaData: response, });

                    from = to + 1;
                    to += stepSize;
                    console.log(`Loading next batch from ${from} to ${to}`);
                } else {
                    console.log('Done loading all elements');
                    break;
                }
            } else {
                console.log('Last batch did not return any new elements. Terminating');
                break;
            }
        }
        this.setState({ metaData: response, loaded: true, });
    }

    loadDependents = async () => {
        const loadDependentsCallback = (response) => {
            if (response.error) {
                this.props.showError(`Unable to load dependents`);
                this.setState({ dependentsLoaded: true, });
                return;
            }
            this.setState({ dependents: response, dependentsLoaded: true, });
        };

        APIHelper.loadReferenceDataDependents(this.props.type, this.props.name, loadDependentsCallback);
    }

    purgeData = () => {
        this.props.displayLoadingModal(true);

        const purgeDataCallback = (response) => {
            this.tableChanged('new', []);
            this.updateMetaData(response);
            this.props.displayLoadingModal(false);
        };

        APIHelper.purgeReferenceData(this.props.type, this.props.name, purgeDataCallback);
    }

    download(name, content, hasInnerKey, hasOuterKey) {
        let exportString = '';
        if (hasOuterKey) exportString += 'parentKey,';
        if (hasInnerKey) exportString += 'key,';
        exportString += 'value,first_seen,last_seen,source\n';
        for (const value of content) {
            if (hasOuterKey) exportString += '"' + value.outer_key.replace(/"/g, '""') + '",';
            if (hasInnerKey) exportString += '"' + value.key.replace(/"/g, '""') + '",';
            exportString += '"' + value.value.replace(/"/g, '""') + '","' + value.first_seen + '","' + value.last_seen + '","' + value.source.replace(/"/g, '""') + '"\n';
        }

        const blob = new Blob([exportString,], { type: "text/csv", });
        fileSaver.saveAs(blob, `${name}.csv`);
    }

    reload = async () => {
        this.props.displayLoadingModal(true);
        await this.loadData(true);
        this.props.displayLoadingModal(false);
    }

    // Add handlers for click on buttons to display inputModal and register 'onSave' action
    clickAddItem = () => { this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: EntryDefinitions[this.type + 'AddItem'], }); }
    clickAddInnerItem = (key) => { this.setState({ showInputModal: true, modalSave: (e) => this.addInnerItem(key, e), modalInputDefinition: EntryDefinitions[this.type + 'AddInnerItem'], }); }
    clickBulkAddItem = () => { this.setState({ showInputModal: true, modalSave: this.bulkAddItems, modalInputDefinition: EntryDefinitions[this.type + 'BulkAddItems'], }); }
    clickImportItems = () => { this.setState({ showInputModal: true, modalSave: this.importItems, modalInputDefinition: EntryDefinitions[this.type + 'ImportItems'], }); }
    clickDeleteItem = (selectedRow) => { this.deleteItem(selectedRow); }
    clickDeleteInnerItem = (outer_key, selectedRows) => { this.deleteInnerItem(outer_key, selectedRows); }

    tableChanged = (type, options) => {
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
                entry['index'] = i++; // required unique key for dataTable
                tableData.push(entry);
            }
        }
        this.setState({ tableData, searchText, allEntries, });
    }

    getIFrameDoc = (obj) => (obj.contentDocument || obj.contentWindow.document)

    /**
       * Display the default QRadar Rule Editor Wizard and register handlers for the Finish/Close Buttons
       * @param {Object} id The rule which is supposed to be updated. We only care for an Object that hasOwnProperty('ruleID')
       */
    showEditRuleModal = (id) => {
        if (!this.state.editRuleModalOpen) {
            // Display the modal
            this.setState(prevState => ({ editRuleModalOpen: true, }));
            // Then wait until it has actually been opened
            const waitForModalToOpen = setInterval(() => {
                if (window.frames['rulesWindow'] !== undefined) {
                    window.frames['rulesWindow'].location.href = Config.ruleWizardBase + id;
                    clearInterval(waitForModalToOpen);
                    let counter = 0;
                    const tryRegisterListeners = setInterval(() => {
                        try {
                            // we try to register a new listener to the finish and close buttons of the frame
                            const ruleFrame = this.getIFrameDoc(document.getElementById('ruleWizardFrame'))
                            const navFrame = this.getIFrameDoc(ruleFrame.getElementById('navigation'));
                            // on finish, details may have changed and we need to update rule data
                            const closeButton = navFrame.getElementById("closeButton");
                            const finishButton = navFrame.getElementById("finishButton");

                            finishButton.addEventListener('click', this.saveRule);
                            // on close, we don't need to update anything and can simply close the modeal
                            closeButton.addEventListener('click', this.closeRuleModal);
                            // if this works, we can clear the interval
                            clearInterval(tryRegisterListeners);
                        } catch (err) {
                            // if registering listeners didn't work, we try again in one second
                            if (counter++ >= 20) { // we only try 20 times
                                clearInterval(tryRegisterListeners); // if after ten tries we fail, we will not try again (prevent memory leaks);
                                console.log('Something went wrong with registering the close handlers for the frame. Frame can be closed by clicking in the window background');
                                console.log(err);
                            }
                        }
                    }, 1000);
                }
            }, 100);
        } else {
            this.closeRuleModal();
        }
    }

    saveRule = () => {
        setTimeout(function () {
            const ruleFrame = this.getIFrameDoc(document.getElementById('ruleWizardFrame'))
            const navFrame = this.getIFrameDoc(ruleFrame.getElementById('content'));
            const body = navFrame.getElementsByTagName("body")[0];
            if (body.hasAttribute("onload")) {
                this.closeRuleModal();
                return;
            }

            const errorMessage = document.getElementsByClassName("errorMessage");
            if (errorMessage.length > 0) {
                return;
            } else {
                this.saveRule();
            }
        }, 400);
    };

    /**
     * Close the edit rule modal without making any changes to the underlying data (i.e. don't reload rules etc.)
     */
    closeRuleModal = () => this.setState({ editRuleModalOpen: false, });

    render() {
        return (
            <React.Fragment>
                <InputModal
                    modal={this.state.showInputModal}
                    save={this.state.modalSave}
                    entries={JSON.parse(JSON.stringify(this.state.modalInputDefinition))}
                    closeModal={(e) => this.setState(prevState => ({ showInputModal: !prevState.showInputModal, }))}
                />
                <Modal
                    className='rule-wizard-modal'
                    size='sm'
                    open={this.state.editRuleModalOpen}
                    passiveModal={true}
                    onRequestClose={this.closeRuleModal}
                >
                    <iframe id='ruleWizardFrame' name='rulesWindow' className='rule-wizard-frame' />
                </Modal>
                <MetaData
                    data={this.state.metaData}
                    typeLabel={this.type}
                    deleteEntry={this.props.deleteEntry}
                    purgeData={this.purgeData}
                    reload={this.reload}
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
                    />
                    :
                    <DataTableSkeleton rowCount={Math.min(10, this.props.size + 1 || 1)} columnCount={this.headers[this.type].length} />
                }
                <div className='separator'></div>
                <Dependents dependents={this.state.dependents} loaded={this.state.dependentsLoaded} editRule={this.showEditRuleModal} />
            </React.Fragment>
        );
    }
}

export default ReferenceData;
