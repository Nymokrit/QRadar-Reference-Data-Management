import React, { Component } from 'react';
import { Search, Accordion, AccordionItem, Tag, Button, UnorderedList } from 'carbon-components-react';
/*
Register MenuItemListener by adding a callback to props['menuItemAction']
*/
class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
        };

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
        return (
            <div className='menu' >
                <Search type='text' labelText='Search' placeHolderText='Search' light onChange={this.handleChange} value={this.state.searchText} />
                <Accordion>
                    {
                        Object.keys(this.props.refData).map(refDataType =>
                            <AccordionItem key={refDataType} open={this.props.refData[refDataType].isOpen} title={this.props.refData[refDataType].label} className='menu-title' onClick={() => this.toggleMenu(refDataType)}>
                                <Button kind='primary' size='small' onClick={(e) => this.props.createEntry(e, refDataType)} key={'btn-' + refDataType}>
                                    Create New
                                </Button>
                                <UnorderedList className='menu-list'>
                                    {
                                        Object.keys(this.props.refData[refDataType].nodes).map(refDataEntry => {
                                            if (!this.matchSearch(refDataEntry)) return <React.Fragment></React.Fragment>;
                                            const entry = this.props.refData[refDataType].nodes[refDataEntry];
                                            return (
                                                <Button kind='ghost' size='small' key={entry.label} className='menu-entry' onClick={(e) => this.props.menuItemAction(e, entry)} >
                                                    {entry.label}
                                                    <Tag type='cool-gray' className='menu-entry-badge'>{entry.size || '0'}</Tag>
                                                </Button>
                                            );
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