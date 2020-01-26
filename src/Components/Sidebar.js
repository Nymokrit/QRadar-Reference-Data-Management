import React, { Component } from 'react';

import { Badge, CardHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*
Register MenuItemListener by adding a callback to props['menuItemAction']
*/
class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
        };
        // console.log(this.props.refData)

        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.matchSearch = this.matchSearch.bind(this);
    }

    toggleMenu(type) {
        const entries = this.props.refData;
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
        Object.keys(this.props.refData).map((type) => this.props.refData[type].isOpen = true);
        this.setState({ searchText: event.target.value, });
    }

    render() {
        const icon = { maps: 'map', sets: 'ellipsis-h', map_of_sets: 'list-ul', tables: 'table', };
        return (
            <div className='ref-data-menu' >
                <div className='ref-data-menu-search-wrapper'>
                    <input type='text' placeholder='Search' onChange={this.handleChange} value={this.state.searchText} className='ref-data-menu-search' />
                </div>
                {
                    Object.keys(this.props.refData).map(refDataType => (
                        <React.Fragment key={refDataType} >
                            <CardHeader className='ref-data-menu-title' onClick={() => this.toggleMenu(refDataType)}>
                                <FontAwesomeIcon icon={'chevron-' + (this.props.refData[refDataType].isOpen ? 'down' : 'right')} />
                                {this.props.refData[refDataType].label}
                                <button
                                    className='btn-default btn-create'
                                    onClick={(e) => this.props.createEntry(e, refDataType)}
                                    title='Create new entry'
                                ><FontAwesomeIcon icon='plus' />
                                </button>
                            </CardHeader>
                            {this.props.refData[refDataType].isOpen &&
                                Object.keys(this.props.refData[refDataType].nodes).map(refDataEntry => {
                                    if (!this.matchSearch(refDataEntry)) return <React.Fragment></React.Fragment>;
                                    const entry = this.props.refData[refDataType].nodes[refDataEntry];
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