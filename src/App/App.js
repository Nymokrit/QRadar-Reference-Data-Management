const success = ['background: green', 'color: white', 'display: block', 'text-align: center',].join(';');
const failure = ['background: red', 'color: white', 'display: block', 'text-align: center',].join(';');
console.success = msg => console.log(`%c${msg}`, success);
console.fail = msg => console.log(`%c${msg}`, failure);


import React, { Component } from 'react';
import { Modal, Alert } from 'reactstrap';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faCheck, faTimes, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faQuestionCircle, faCog, faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faChevronRight, faChevronDown, faCheck, faTimes, faPlus, faMinus, faTable, faEllipsisH, faListUl, faMap, faQuestionCircle, faCog, faTrash);

import './App.scss';

import { dataTableColumns } from '../Definitions/TableColumnDefinitions';
import Sidebar from '../Components/Sidebar';
import ReferenceSet from '../Components/ReferenceDataTypes/ReferenceSet';
import ReferenceMap from '../Components/ReferenceDataTypes/ReferenceMap';
import ReferenceMapOfSets from '../Components/ReferenceDataTypes/ReferenceMapOfSets';
import ReferenceTable from '../Components/ReferenceDataTypes/ReferenceTable';
import NewEntry from '../Components/NewEntry';
import * as APIHelper from '../Store/APIHelper';
import DataStore from '../Store/DataStore';


class App extends Component {
  constructor(props) {
    super(props);
    DataStore.init();

    this.refDataMapping = { 'maps': ReferenceMap, 'sets': ReferenceSet, 'map_of_sets': ReferenceMapOfSets, 'tables': ReferenceTable, };

    this.state = { allRefData: [], refreshData: false, atHome: !(DataStore.currentRefDataEntry && DataStore.currentRefDataEntry.selectedEntryName), errorMessages: [], displayError: false, };

    this.refreshSidebar = this.refreshSidebar.bind(this);
    this.updateOverviewData = this.updateOverviewData.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.createEntry = this.createEntry.bind(this);
    this.entryCreated = this.entryCreated.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
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

    const response = await APIHelper.createReferenceData(this.state.createNewReferenceEntryType, mappedEntries);
    if (response.error) {
      this.showError(response.message);
    } else {
      const api = this.state.createNewReferenceEntryType + '/' + mappedEntries.name;
      DataStore.currentRefDataEntry = { selectedEntryAPI: api, selectedEntryName: mappedEntries.name, selectedEntrySize: 0, selectedEntryType: this.state.createNewReferenceEntryType, };
      this.setState({
        createNew: false,
        atHome: false,
      });

      this.refreshSidebar();
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

  updateOverviewData() {
    this.setState({ allRefData: DataStore.allRefData, });
  }

  render() {
    // Need to reassign this.state.refDataType because a React Component needs to start with a capital letter
    const ReferenceDataComponent = this.refDataMapping[DataStore.currentRefDataEntry && DataStore.currentRefDataEntry.selectedEntryType];
    return (
      <SplitterLayout
        secondaryInitialSize={84}
        percentage>
        <Sidebar
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
            <NewEntry
              type={this.state.createNewReferenceEntryType}
              save={this.entryCreated}
            />
            :
            (this.state.atHome ?
              <React.Fragment />
              :
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

            )
          }
        </div>
      </SplitterLayout>
    );
  }
}

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


export default App;
