import React, { Component } from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";

import { Loading, InlineNotification } from 'carbon-components-react';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';


import './App.scss';
import Sidebar from '../Components/Sidebar';
import ReferenceSet from '../Components/ReferenceDataTypes/ReferenceSet';
import ReferenceMap from '../Components/ReferenceDataTypes/ReferenceMap';
import ReferenceMapOfSets from '../Components/ReferenceDataTypes/ReferenceMapOfSets';
import ReferenceTable from '../Components/ReferenceDataTypes/ReferenceTable';
import NewEntry from '../Components/NewEntry';
import * as APIHelper from '../Util/APIHelper';


const success = ['background: green', 'color: white', 'display: block', 'text-align: center',].join(';');
const failure = ['background: red', 'color: white', 'display: block', 'text-align: center',].join(';');
console.success = msg => console.log(`%c${msg}`, success);
console.fail = msg => console.log(`%c${msg}`, failure);

class App extends Component {
  constructor(props) {
    super(props);

    this.refDataMapping = { 'maps': ReferenceMap, 'sets': ReferenceSet, 'map_of_sets': ReferenceMapOfSets, 'tables': ReferenceTable, };
    const refData = {
      'sets': { key: 'sets', label: 'Reference Sets', nodes: {}, isOpen: false, },
      'maps': { key: 'maps', label: 'Reference Maps', nodes: {}, isOpen: false, },
      'map_of_sets': { key: 'map_of_sets', label: 'Reference Map of Sets', nodes: {}, isOpen: false, },
      'tables': { key: 'tables', label: 'Reference Tables', nodes: {}, isOpen: false, },
    };

    this.state = { refData, errorMessages: [], displayError: false, loadingModalOpen: false, };

    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.createEntry = this.createEntry.bind(this);
    this.entryCreated = this.entryCreated.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.displayLoadingModal = this.displayLoadingModal.bind(this);
    this.showError = this.showError.bind(this);
    this.getRefData = this.getRefData.bind(this);

    this.getRefData();
  }

  menuItemClicked(e, event) {
    e.stopPropagation();
    // event contains information about the currently selected api (e.g. event.key == 'sets/testRefSet')
    this.setState({
      currentRefDataEntry: { selectedEntryAPI: event.key, selectedEntryName: event.label, selectedEntrySize: event.size, selectedEntryType: event.datatype, },
      atHome: false,
      createNew: false,
    });
  }

  createEntry(e, type) {
    e.stopPropagation();
    this.setState({ createNew: true, createNewReferenceEntryType: type, });
  }

  async entryCreated(entries) {
    this.displayLoadingModal(true);
    const mappedEntries = {};
    // RefSet, RefMap and RefMoS can be created identically, refTable requires some more preprocessing
    if (entries.inner_labels) {
      mappedEntries.outer_key_label = entries.key_label.value;
      const key_name_types = []; // for the api we ned to rename some things
      Object.keys(entries.inner_labels.values).forEach((key) => {
        key_name_types.push(
          {
            key_name: entries.inner_labels.values[key].label,
            element_type: entries.inner_labels.values[key].type,
          });
      });
      mappedEntries.key_name_types = JSON.stringify(key_name_types);
    }

    for (const key in entries) {
      if (key === 'key_label' || key === 'inner_labels') continue;// We ignore the 'old' names
      mappedEntries[key] = entries[key].value;
    }

    const response = await APIHelper.createReferenceData(this.state.createNewReferenceEntryType, mappedEntries);
    if (response.error) {
      this.showError(response.message);
    } else {
      const api = this.state.createNewReferenceEntryType + '/' + mappedEntries.name;
      this.setState({
        currentRefDataEntry: { selectedEntryAPI: api, selectedEntryName: mappedEntries.name, selectedEntrySize: 0, selectedEntryType: this.state.createNewReferenceEntryType, },
        createNew: false,
        atHome: false,
      });

      this.getRefData();
    }
    this.displayLoadingModal(false);
  }

  async deleteEntry() {
    const save = window.confirm('Do you really want to delete this entry');
    if (save) {
      this.displayLoadingModal(true);

      const deleteEntryCallback = (response) => {
        if (response.error) {
          this.showError(response.message);
        } else {
          this.setState({ atHome: true, currentRefDataEntry: undefined, });
          this.getRefData();
        }
        this.displayLoadingModal(false);
      };
      await APIHelper.deleteReferenceData(this.state.currentRefDataEntry.selectedEntryType, this.state.currentRefDataEntry.selectedEntryName, deleteEntryCallback);
    } else return;
  }

  displayLoadingModal(state) {
    this.setState({ loadingModalOpen: state, });
  }

  showError(message) {
    const messages = this.state.errorMessages;
    if (!message) message = 'An unspecified error occured';
    message = Array.isArray(message) ? message : [message,];
    messages.push(...message);
    this.setState({ displayError: true, errorMessages: messages, });
  }

  async getRefData() {
    // const overviewData = [];
    const data = this.state.refData;
    for (const key in data) {
      const response = await APIHelper.loadReferenceData(key);
      if (response.error) {
        this.props.showError('Unable to load ' + data[key].label);
        continue;
      }
      data[key].nodes = {}; // Clear 'old' node data
      data[key].size = response.length;
      data[key].datatype = key.replace(/_/g, ' ');
      response.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
      response.forEach(element => {
        const newEntry = { label: element.name, size: element.number_of_elements, datatype: key, key: key + '/' + element.name, };
        data[key].nodes[element.name] = newEntry;
      });
    }
    this.setState({ refData: data, });
  }

  render() {
    // Need to reassign this.state.refDataType because a React Component needs to start with a capital letter

    let type = '';
    let api = '';
    let name = '';
    let size; // undefined when directly accessing a ref data link like "#/data/sets/early_warning"

    if (this.state.currentRefDataEntry) { // We 
      type = this.state.currentRefDataEntry.selectedEntryType;
      api = this.state.currentRefDataEntry.selectedEntryAPI;
      name = this.state.currentRefDataEntry.selectedEntryName;
      size = this.state.currentRefDataEntry.selectedEntrySize;
    }
    if (!type && window.location.hash.includes('#/data/')) {
      let _; // throw away
      api = decodeURI(window.location.hash.substring('#/data'.length)); // API is the part after #/data/{type}/{name}
      [_, type, name] = api.split('/');
    }

    const ReferenceDataComponent = this.refDataMapping[type];
    return (
      <Router>
        <SplitterLayout
          secondaryInitialSize={84}
          percentage>
          <Sidebar
            menuItemAction={this.menuItemClicked}
            showError={this.showError}
            createEntry={this.createEntry}
            refData={this.state.refData}
          />
          <div id='content'>
            {this.state.displayError && <InlineNotification
              kind='error'
              className='error-alert'
              onCloseButtonClick={(e) => { this.setState({ displayError: false, errorMessages: [], }); }}
              title='Error'
            >
              {this.state.errorMessages.map(message => <span key={message} className='error-alert-message'>{message}<br /></span>)}
            </InlineNotification>}
            <Loading active={this.state.loadingModalOpen} withOverlay />
            {this.state.createNew ?
              <NewEntry
                type={this.state.createNewReferenceEntryType}
                save={this.entryCreated}
              />
              :
              (!ReferenceDataComponent ?
                <React.Fragment />
                :
                <ReferenceDataComponent
                  key={api}
                  api={api}
                  name={name}
                  type={type}
                  size={size}
                  deleteEntry={this.deleteEntry}
                  dataUpdated={this.getRefData}
                  displayLoadingModal={this.displayLoadingModal}
                  showError={this.showError}
                />
              )
            }
          </div>
        </SplitterLayout>
      </Router >
    );
  }
}

export default App;
