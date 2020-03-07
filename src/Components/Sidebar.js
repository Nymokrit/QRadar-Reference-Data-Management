import React, { Component } from 'react';
import { Search, Accordion, AccordionItem, Tag, Button, UnorderedList, SkeletonText } from 'carbon-components-react';

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
        };

        this.toggleMenu = this.toggleMenu.bind(this);
        this.searchInputChanged = this.searchInputChanged.bind(this);
        this.matchesCurrentSearch = this.matchesCurrentSearch.bind(this);
    }

    toggleMenu(type) {
        //const entries = this.props.refData;
        this.props.refData[type].isOpen = !this.props.refData[type].isOpen;
        this.setState({ entries: this.props.refData, });
    }

    matchesCurrentSearch(entry) {
        const searchText = this.state.searchText;
        try {
            const regex = new RegExp(searchText, 'i');
            return entry.match(regex);
        } catch (e) {
            return entry.toLowerCase().includes(searchText.toLowerCase());
        }
    }

    searchInputChanged(event) {
        Object.keys(this.props.refData).map((type) => this.props.refData[type].isOpen = true);
        this.setState({ searchText: event.target.value, });
    }

    render() {
        return (
            <div className='menu' >
                <Search type='text' labelText='Search' placeHolderText='Search' light onChange={this.searchInputChanged} value={this.state.searchText} />
                <Accordion>
                    {
                        Object.keys(this.props.refData).map(type =>
                            <AccordionItem key={type} open={this.props.refData[type].isOpen} title={this.props.refData[type].label} className='menu-title' onClick={() => this.toggleMenu(type)}>
                                <Button kind='primary' size='small' className='btn-create-new' onClick={(e) => this.props.createEntry(e, type)} key={'btn-' + type}>
                                    Create New
                                </Button>
                                <UnorderedList className='menu-list'>
                                    {
                                        this.props.refData[type].size === undefined // Require === undefined because there might be a data type where there are actually 0 entries
                                            ? <SkeletonText paragraph lineCount={3} heading />
                                            : Object.keys(this.props.refData[type].nodes).map(entryName => {
                                                if (this.matchesCurrentSearch(entryName)) {
                                                    const entry = this.props.refData[type].nodes[entryName];
                                                    return (
                                                        <Button kind='ghost' size='small' key={entry.label} className='menu-entry' onClick={(e) => this.props.menuItemAction(e, entry)} >
                                                            {entry.label}
                                                            <Tag className='menu-entry-badge'>{entry.size || '0'}</Tag>
                                                        </Button>
                                                    );
                                                }
                                            })
                                    }
                                </UnorderedList>
                            </AccordionItem>
                        )
                    }
                </Accordion>
            </div>
        );
    }
}

export default Sidebar;