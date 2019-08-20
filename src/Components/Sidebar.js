import React, { Component } from 'react';

import { Badge, CardHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as APIHelper from '../Store/APIHelper';
import DataStore from '../Store/DataStore';

/*
Register MenuItemListener by adding a callback to props['menuItemAction']
*/
class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
        };
        // console.log(DataStore.refData)

        this.updateMenuData = this.updateMenuData.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.matchSearch = this.matchSearch.bind(this);
    }

    // On first load and on subsequent changes check for new data if necessary
    componentDidMount() { this.getRefData(); }
    componentDidUpdate() {
        if (this.props.refreshData) {
            this.getRefData();
        }
    }

    toggleMenu(type) {
        const entries = DataStore.refData;
        entries[type].isOpen = !entries[type].isOpen;
        this.setState({ entries: entries, });
    }

    matchSearch(entry) {
        const searchText = this.state.searchText;
        try {
            const regex = new RegExp(searchText, 'i');
            return entry.match(regex);
        } catch (e) {
            return entry.toLowerCase().includes(searchText.toLowerCase());
        }
    }

    handleChange(event) {
        this.setState({ searchText: event.target.value, });
    }

    async getRefData() {
        DataStore.allRefData = [];
        // const overviewData = [];
        for (const key in DataStore.refData) {
            const response = await APIHelper.loadReferenceData(key);
            if (response.error) {
                this.props.showError('Unable to load ' + DataStore.refData[key].label);
                continue;
            }
            this.updateMenuData(key, response);
        }
    }

    updateMenuData(key, response) {
        const data = DataStore.refData;
        data[key].nodes = {}; // Clear 'old' node data
        data[key].size = response.length;
        data[key].datatype = key.replace(/_/g, ' ');
        response.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
        response.forEach(element => {
            const newEntry = { label: element.name, size: element.number_of_elements, datatype: key, key: key + '/' + element.name, };
            data[key].nodes[element.name] = newEntry;
            DataStore.allRefData.push(element);
            // overviewData.push({ creation_time: element.creation_time, ...newEntry, });
        });

        this.setState({ refData: data, });
        this.props.updateOverviewData();
    }

    render() {
        const icon = { maps: 'map', sets: 'ellipsis-h', map_of_sets: 'list-ul', tables: 'table', };
        return (
            <div className='ref-data-menu' >
                <div className='ref-data-menu-search-wrapper'>
                    <input type='text' placeholder='Search' onChange={this.handleChange} value={this.state.searchText} className='ref-data-menu-search' />
                </div>
                {
                    Object.keys(DataStore.refData).map(refDataType => (
                        <React.Fragment key={refDataType} >
                            <CardHeader className='ref-data-menu-title' onClick={() => this.toggleMenu(refDataType)}>
                                <FontAwesomeIcon icon={'chevron-' + (DataStore.refData[refDataType].isOpen ? 'down' : 'right')} />
                                {DataStore.refData[refDataType].label}
                                <button
                                    className='btn-default btn-create'
                                    onClick={(e) => this.props.createEntry(e, refDataType)}
                                    title='Create new entry'
                                ><FontAwesomeIcon icon='plus' />
                                </button>
                            </CardHeader>
                            {DataStore.refData[refDataType].isOpen &&
                                Object.keys(DataStore.refData[refDataType].nodes).map(refDataEntry => {
                                    if (!this.matchSearch(refDataEntry)) return <React.Fragment></React.Fragment>;
                                    const entry = DataStore.refData[refDataType].nodes[refDataEntry];
                                    return <React.Fragment key={entry.label}>
                                        <div className='ref-data-menu-entry' onClick={(e) => this.props.menuItemAction(entry)}>
                                            <div className='ref-data-menu-entry-icon'>
                                                <FontAwesomeIcon icon={icon[entry.datatype]} />
                                            </div>
                                            <div className='ref-data-menu-entry-name'>
                                                {entry.label}
                                            </div>
                                            <div className='ref-data-menu-entry-badge'>
                                                <Badge color='default' pill>{entry.size || '0'}</Badge>
                                            </div>
                                        </div>
                                    </React.Fragment>;
                                })
                            }
                        </React.Fragment>
                    )
                    )
                }
            </div>
        );
    }
}

export default Sidebar;