import React, { Component } from 'react';

import { Search, Accordion, AccordionItem, Tag, Button, UnorderedList, ListItem } from 'carbon-components-react';

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
                    <Search type='text' placeholder='Search' onChange={this.handleChange} value={this.state.searchText} className='ref-data-menu-search' />
                </div>
                <Accordion>
                    {
                        Object.keys(this.props.refData).map(refDataType => (
                            <AccordionItem open={this.props.refData[refDataType].isOpen} title={this.props.refData[refDataType].label} className='ref-data-menu-title' onClick={() => this.toggleMenu(refDataType)}>
                                <Button
                                    kind='primary'
                                    size='small'
                                    className='btn-default btn-create'
                                    onClick={(e) => this.props.createEntry(e, refDataType)}
                                    key={'btn-' + refDataType}
                                >
                                    Create New
                                </Button>
                                <UnorderedList className='ref-data-menu-list'>
                                    {
                                        Object.keys(this.props.refData[refDataType].nodes).map(refDataEntry => {
                                            if (!this.matchSearch(refDataEntry)) return <React.Fragment></React.Fragment>;
                                            const entry = this.props.refData[refDataType].nodes[refDataEntry];
                                            return (
                                                <Button kind='ghost' size='small' key={entry.label} className='ref-data-menu-entry' onClick={(e) => this.props.menuItemAction(e, entry)}>
                                                    {entry.label}
                                                    <Tag className='ref-data-menu-entry-badge'>{entry.size || '0'}</Tag>
                                                </Button>
                                            );
                                        })
                                    }
                                </UnorderedList>
                            </AccordionItem>
                        )
                        )
                    }
                </Accordion>
            </div>
        );
    }
}

export default Sidebar;

/*
                                <FontAwesomeIcon icon={'chevron-' + (this.props.refData[refDataType].isOpen ? 'down' : 'right')} />
                                <button
                                    className='btn-default btn-create'
                                    onClick={(e) => this.props.createEntry(e, refDataType)}
                                    title='Create new entry'
                                ><FontAwesomeIcon icon='plus' />
                                </button>
                                */