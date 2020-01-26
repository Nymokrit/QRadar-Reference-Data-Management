const success = ['background: green', 'color: white', 'display: block', 'text-align: center',].join(';');
const failure = ['background: red', 'color: white', 'display: block', 'text-align: center',].join(';');
console.success = msg => console.log(`%c${msg}`, success);
console.fail = msg => console.log(`%c${msg}`, failure);


import React, { Component } from 'react';
import { Modal, Alert } from 'reactstrap';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faCheck, faTimes, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faQuestionCircle, faCog, faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faChevronRight, faChevronDown, faCheck, faTimes, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faQuestionCircle, faCog, faTrash);

import './App.scss';

import Sidebar from '../Components/Sidebar';
import ReferenceSet from '../Components/ReferenceDataTypes/ReferenceSet';
import ReferenceMap from '../Components/ReferenceDataTypes/ReferenceMap';
import ReferenceMapOfSets from '../Components/ReferenceDataTypes/ReferenceMapOfSets';
import ReferenceTable from '../Components/ReferenceDataTypes/ReferenceTable';
import NewEntry from '../Components/NewEntry';
import * as APIHelper from '../Util/APIHelper';

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

    this.state = { refData, errorMessages: [], displayError: false, };

    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.createEntry = this.createEntry.bind(this);
    this.entryCreated = this.entryCreated.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.showError = this.showError.bind(this);
    this.getRefData = this.getRefData.bind(this);

    this.getRefData();
  }

  menuItemClicked(event) {
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
          this.getRefData();
        }
        this.toggleLoading();
      };
      await APIHelper.deleteReferenceData(this.state.currentRefDataEntry.selectedEntryType, this.state.currentRefDataEntry.selectedEntryName, deleteEntryCallback);
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
    const ReferenceDataComponent = this.refDataMapping[this.state.currentRefDataEntry && this.state.currentRefDataEntry.selectedEntryType];
    return (
      <SplitterLayout
        secondaryInitialSize={84}
        percentage>
        <Sidebar
          menuItemAction={this.menuItemClicked}
          showError={this.showError}
          createEntry={this.createEntry}
          refData={this.state.refData}
        />
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
            <NewEntry
              type={this.state.createNewReferenceEntryType}
              save={this.entryCreated}
            />
            :
            (!ReferenceDataComponent ?
              <React.Fragment />
              :
              <ReferenceDataComponent
                key={this.state.currentRefDataEntry.selectedEntryAPI}
                api={this.state.currentRefDataEntry.selectedEntryAPI}
                name={this.state.currentRefDataEntry.selectedEntryName}
                type={this.state.currentRefDataEntry.selectedEntryType}
                size={this.state.currentRefDataEntry.selectedEntrySize}
                deleteEntry={this.deleteEntry}
                dataUpdated={this.getRefData}
                toggleLoading={this.toggleLoading}
                showError={this.showError}
              />

            )
          }
        </div>
      </SplitterLayout>
    );
  }
}
/*
class WelcomePage extends Component {
  icon = { maps: 'map', sets: 'ellipsis-h', map_of_sets: 'list-ul', tables: 'table', };

  render() {
    const { SearchBar, } = Search;
    const contentTable = ({ paginationProps, paginationTableProps, }) => (
      <ToolkitProvider
        keyField='id'
        data={this.props.data}
        columns={dataTableColumns}
        search
      >
        {toolkitprops => (
          <React.Fragment>
            <button className='btn-default btn-ref-data btn-export' onClick={this.props.exportItems}>Export CSV</button>
            <SearchBar {...toolkitprops.searchProps} />
            <BootstrapTable
              hover
              keyField='name'
              remote={{ search: true, }}
              {...toolkitprops.baseProps}
              {...paginationTableProps}
            />
          </React.Fragment>
        )}
      </ToolkitProvider>
    );

    return (
      <React.Fragment>
        <PaginationProvider pagination={paginationFactory()}>
          {contentTable}
        </PaginationProvider>
      </React.Fragment>
    );
  }
}
*/

export default App;
