import React, { Component } from 'react';
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

import i18n from '../I18n/i18n';

class App extends Component {
  constructor(props) {
    super(props);

    this.refDataMapping = { 'maps': ReferenceMap, 'sets': ReferenceSet, 'map_of_sets': ReferenceMapOfSets, 'tables': ReferenceTable, };
    const refData = {
      'sets': { key: 'sets', label: i18n.t('data.sidebar.type', { type: 'Set' }), nodes: {}, },
      'maps': { key: 'maps', label: i18n.t('data.sidebar.type', { type: 'Map' }), nodes: {}, },
      'map_of_sets': { key: 'map_of_sets', label: i18n.t('data.sidebar.type', { type: 'Map of Sets' }), nodes: {}, },
      'tables': { key: 'tables', label: i18n.t('data.sidebar.type', { type: 'Table' }), nodes: {}, },
    };

    this.state = { refData, errorMessages: [], loading: false, };
    this.getRefData();
  }

  menuItemClicked = (e, item) => {
    e && e.stopPropagation();
    this.updateHash('view/' + item.key); // (e.g. item.key == 'sets/testRefSet')
    this.setState({ updated: true, });
  }

  createEntry = (e, type) => {
    e.stopPropagation();
    this.updateHash('create/' + type);
    this.setState({ updated: true, });
  }

  entryCreated = async (entries, type) => {
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

    const response = await APIHelper.createReferenceData(type, mappedEntries);
    if (response.error) {
      this.showError(response.message);
    } else {
      const key = type + '/' + response.name
      this.state.refData[type].nodes[response.name] = { label: response.name, size: 0, datatype: type, key: key, };
      // pretend we clicked directly on the newly created data entry to open the entry
      this.menuItemClicked(undefined, { key })
    }
    this.displayLoadingModal(false);
  }

  deleteEntry = async () => {
    const save = window.confirm('Do you really want to delete this entry');
    if (save) {
      this.displayLoadingModal(true);
      const [api, action, type, name] = this.parseHash();

      const deleteEntryCallback = (response) => {
        if (response.error) {
          this.showError(response.message);
        } else {
          this.updateHash('');
          delete this.state.refData[type].nodes[name]; // remove menu entry
          this.setState({ updated: true });
        }
        this.displayLoadingModal(false);
      };
      await APIHelper.deleteReferenceData(type, name, deleteEntryCallback);
    } else return;
  }

  showError = (message) => {
    const messages = this.state.errorMessages;
    if (!message) message = 'An unspecified error occured';
    message = Array.isArray(message) ? message : [message,];
    messages.push(...message);
    this.setState({ errorMessages: messages, });
  }

  getRefData = async () => {
    // const overviewData = [];
    const data = this.state.refData;
    for (const key in data) {
      const response = await APIHelper.loadReferenceData(key);
      if (response.error) {
        this.showError('Unable to load ' + data[key].label);
        continue;
      }
      data[key].nodes = {}; // Clear 'old' node data
      data[key].size = response.length;
      data[key].datatype = key.replace(/_/g, ' ');
      response.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
      response.forEach(element => { data[key].nodes[element.name] = { label: element.name, size: element.number_of_elements, datatype: key, key: key + '/' + element.name, } });
    }
    this.setState({ refData: data, });
  }

  parseHash = () => {
    const api = decodeURI(window.location.hash.substring('#/data'.length)); // API is the part after #/data/{action}/{type}/{name}
    const [_, action, type, name] = api.split('/');
    return [type + '/' + name, action, type, name];
  }

  updateHash = (api) => window.location.hash = '/data/' + api
  displayLoadingModal = (open) => this.setState({ loading: open, })

  render() {
    let type = '';
    let api = '';
    let action = '';
    let name = '';
    if (window.location.hash.includes('#/data/')) [api, action, type, name] = this.parseHash()


    // Need to reassign this.state.refDataType because a React Component needs to start with a capital letter
    const ReferenceDataComponent = this.refDataMapping[type];
    return (
      <SplitterLayout secondaryInitialSize={84} percentage>
        <Sidebar
          menuItemAction={this.menuItemClicked}
          showError={this.showError}
          createEntry={this.createEntry}
          refData={this.state.refData}
        />
        <div id='content'>
          <Loading active={this.state.loading} withOverlay />
          {
            this.state.errorMessages.length > 0 &&
            <InlineNotification
              kind='error'
              className='error-alert'
              onCloseButtonClick={(e) => { this.setState({ errorMessages: [], }); }}
              title='Error'
            >
              {this.state.errorMessages.map(message => <span key={message} className='error-alert-message'>{message}<br /></span>)}
            </InlineNotification>
          }
          {
            action === 'create' ?
              <NewEntry type={type} save={(e) => this.entryCreated(e, type)} />
              :
              ReferenceDataComponent &&
              <ReferenceDataComponent
                key={api}
                api={api}
                name={name}
                type={type}
                deleteEntry={this.deleteEntry}
                dataUpdated={this.getRefData}
                displayLoadingModal={this.displayLoadingModal}
                showError={this.showError}
              />
          }
        </div>
      </SplitterLayout>
    );
  }
}

export default App;
