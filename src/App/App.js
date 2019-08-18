const success = ['background: green', 'color: white', 'display: block', 'text-align: center',].join(';');
const failure = ['background: red', 'color: white', 'display: block', 'text-align: center',].join(';');
console.success = msg => console.log(`%c${msg}`, success);
console.fail = msg => console.log(`%c${msg}`, failure);


import React, { Component } from 'react';
import { Modal, Alert } from 'reactstrap';
import axios from 'axios';
import querystring from 'querystring';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown, faChevronRight, faChevronLeft, faExpand, faCompress, faExternalLinkAlt, faCheck, faTimes, faSyncAlt, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faTrash, faQuestionCircle, faCog } from '@fortawesome/free-solid-svg-icons';
library.add(faChevronDown, faChevronRight, faChevronLeft, faTrash, faExpand, faCompress, faExternalLinkAlt, faCheck, faTimes, faSyncAlt, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faQuestionCircle, faCog);

import './App.scss';


import ReferenceDataList from '../Components/ReferenceDataList';
import ReferenceSet from '../Components/ReferenceDataTypes/ReferenceSet';
import ReferenceMap from '../Components/ReferenceDataTypes/ReferenceMap';
import ReferenceMapOfSets from '../Components/ReferenceDataTypes/ReferenceMapOfSets';
import ReferenceTable from '../Components/ReferenceDataTypes/ReferenceTable';
import ReferenceDataNewEntry from '../Components/ReferenceDataNewEntry';
import Config from '../Util/Config';
import * as APIHelper from '../Store/APIHelper';
import DataStore from '../Store/DataStore';


class App extends Component {
  constructor(props) {
    super(props);
    DataStore.init();

    this.refDataMapping = { 'maps': ReferenceMap, 'sets': ReferenceSet, 'map_of_sets': ReferenceMapOfSets, 'tables': ReferenceTable, };

    this.state = { refreshData: false, atHome: !(DataStore.currentRefDataEntry && DataStore.currentRefDataEntry.selectedEntryName), errorMessages: [], displayError: false, };

    this.refreshSidebar = this.refreshSidebar.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.createEntry = this.createEntry.bind(this);
    this.entryCreated = this.entryCreated.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.showError = this.showError.bind(this);

    this.showEditRuleModal = this.showEditRuleModal.bind(this);
    this.closeRuleModal = this.closeRuleModal.bind(this);
    this.showError = this.showError.bind(this);

  }


  showDataErrorMessages() {
    const errorMessages = [];

    errorMessages.push(...DataStore.loadingErrors.map(e => e.message));

    if (errorMessages.length) {
      this.showError(errorMessages);
      DataStore.loadingErrors = [];
    }
  }

  showError(message) {
    document.getElementsByClassName('section-lists')[0].scrollTop = 0;
    const messages = Array.isArray(message) ? message : [message,];
    this.setState({ displayError: true, errorMessages: messages, });
  }

  /**
   * Close the edit rule modal without making any changes to the underlying data (i.e. don't reload rules etc.)
   * @param {Event} e 
   */
  closeRuleModal(e) { this.setState(prevState => ({ editRuleModalOpen: false, })); }

  /**
   * Display the default QRadar Rule Editor Wizard and register handlers for the Finish/Close Buttons
   * @param {Object} rule The rule which is supposed to be updated. We only care for an Object that hasOwnProperty('ruleID')
   */
  showEditRuleModal(rule, type, closeAndUpdateCallback, closeCallback) {
    let id;
    if (rule) {
      id = rule.ruleID;
      closeAndUpdateCallback = this.closeRuleModalAndUpdate;
      closeCallback = this.closeRuleModal;
    }
    if (!this.state.editRuleModalOpen) {
      // Display the modal
      this.setState(prevState => ({ editRuleModalOpen: true, }));
      // Then wait until it has actually been opened
      const waitForModalToOpen = setInterval(() => {
        if (window.frames['rulesWindow'] !== undefined) {
          // When it has been opened, try to load the editor wizard. If the id is defined, we open the edit modal, otherwise the new rule wizard
          if (id)
            window.frames['rulesWindow'].location.href = Config.ruleWizardBase + id;
          else
            window.frames['rulesWindow'].location.href = Config.newRuleWizardBase + type;
          clearInterval(waitForModalToOpen);
          let counter = 0;
          const tryRegisterListeners = setInterval(() => {
            try {
              // we try to register a new listener to the finish and close buttons of the frame
              const navFrame = document.getElementById('ruleWizardFrame').contentDocument.getElementById('navigation').contentDocument;
              // on finish, details may have changed and we need to update rule data
              navFrame.getElementById('finishButton').addEventListener('click', closeCallback);
              // on close, we don't need to update anything and can simply close the modeal
              navFrame.getElementById('closeButton').addEventListener('click', closeCallback);
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

  refreshSidebar() { // needs to be refactored
    this.setState({ refreshData: true, });
    this.setState({ refreshData: false, });
  }

  menuItemClicked(event) {
    // event contains information about the currently selected api (e.g. event.key == 'sets/testRefSet')
    this.setState({
      atHome: false,
      createNew: false,
    });
    DataStore.currentRefDataEntry = { selectedEntryAPI: event.key, selectedEntryName: event.label, selectedEntrySize: event.size, selectedEntryType: event.datatype, };
    console.log(DataStore.currentRefDataEntry);
  }

  createEntry(e, type) {
    e.stopPropagation();
    this.setState({ createNew: true, createNewReferenceEntryType: type, });
  }

  async entryCreated(entries) {
    const mappedEntries = {};
    // RefSet, RefMap and RefMoS can be created identically, refTable requires some more preprocessing
    if (entries.inner_labels) {
      mappedEntries.outer_key_label = entries.key_label.value;
      const key_name_types = [];
      Object.keys(entries.inner_labels.values).forEach((key) => {
        key_name_types.push(
          {
            key_name: entries.inner_labels.values[key].label,
            element_type: entries.inner_labels.values[key].type,
          });
      });
      mappedEntries.key_name_types = JSON.stringify(key_name_types);

      delete entries.key_label;
      delete entries.inner_lables;
    }

    for (const key in entries) {
      mappedEntries[key] = entries[key].value;
    }

    await axios.post(Config.apiRoot + Config.refDataApi + this.state.createNewReferenceEntryType + '?' + querystring.stringify(mappedEntries), {}, { headers: Config.axiosHeaders, });

    const api = this.state.createNewReferenceEntryType + '/' + mappedEntries.name;
    this.setState({
      createNew: false,
      atHome: false,
    });
    DataStore.currentRefDataEntry = { selectedEntryAPI: api, selectedEntryName: mappedEntries.name, selectedEntrySize: 0, selectedEntryType: this.state.createNewReferenceEntryType, };

    this.refreshSidebar();
  }

  async deleteEntry() {
    const save = window.confirm('Do you really want to delete this entry');
    if (save) {
      this.toggleLoading();

      const deleteEntryCallback = (response) => {
        if (response.error) {
          this.showError(response.message);
        } else {
          this.setState({ atHome: true, });
          this.refreshSidebar();
        }
        this.toggleLoading();
      };
      await APIHelper.deleteReferenceData(DataStore.currentRefDataEntry.selectedEntryType, DataStore.currentRefDataEntry.selectedEntryName, deleteEntryCallback);
    } else return;
  }

  toggleLoading() {
    this.setState(prevState => ({ loadingModalOpen: !prevState.loadingModalOpen, }));
  }

  showError(message) {
    const messages = this.state.errorMessages;
    document.getElementsByClassName('ref-data')[0].scrollTop = 0;
    if (!message) message = 'An unspecified error occured';
    message = Array.isArray(message) ? message : [message,];
    messages.push(...message);
    this.setState({ displayError: true, errorMessages: messages, });
  }

  render() {
    // Need to reassign this.state.refDataType because a React Component needs to start with a capital letter
    const ReferenceDataComponent = this.refDataMapping[DataStore.currentRefDataEntry && DataStore.currentRefDataEntry.selectedEntryType];
    return (
      <SplitterLayout
        secondaryInitialSize={84}
        percentage>
        <ReferenceDataList
          menuItemAction={this.menuItemClicked}
          refreshData={this.state.refreshData}
          updateOverviewData={this.updateOverviewData}
          showError={this.showError}
          createEntry={this.createEntry} />
        <div id='content' className='ref-data'>
          <Alert
            color='danger'
            className='error-alert'
            isOpen={this.state.displayError}
            toggle={(e) => this.setState({ displayError: false, errorMessages: [], })}
          >
            {this.state.errorMessages.map(message => <p key={message} className='error-alert-message'>{message}</p>)}
          </Alert>
          <Modal
            className='loading-modal'
            isOpen={this.state.loadingModalOpen}
            toggle={(e) => this.setState(prevState => ({ loadingModalOpen: !prevState.loadingModalOpen, }))}
            modalTransition={{ timeout: 0, }}
            backdrop={true}
          >
            <div className='loading'></div>
          </Modal >
          {this.state.createNew ?
            <ReferenceDataNewEntry
              type={this.state.createNewReferenceEntryType}
              save={this.entryCreated}
            />
            :
            !this.state.atHome &&
            <ReferenceDataComponent
              key={DataStore.currentRefDataEntry.selectedEntryAPI}
              api={DataStore.currentRefDataEntry.selectedEntryAPI}
              name={DataStore.currentRefDataEntry.selectedEntryName}
              type={DataStore.currentRefDataEntry.selectedEntryType}
              size={DataStore.currentRefDataEntry.selectedEntrySize}
              deleteEntry={this.deleteEntry}
              dataUpdated={this.refreshSidebar}
              toggleLoading={this.toggleLoading}
              showError={this.showError}
            />
          }
        </div>
      </SplitterLayout>
    );
  }
}

class WelcomePage extends Component {
  icon = { maps: 'map', sets: 'ellipsis-h', map_of_sets: 'list-ul', tables: 'table', };

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }
}


export default App;
