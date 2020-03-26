import React, { Component } from 'react';
import { Search, Accordion, AccordionItem, Tag, Button, UnorderedList, SkeletonText } from 'carbon-components-react';
import i18n from '../I18n/i18n';
class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = { searchText: '', };
    }

    toggleMenu = (type) => this.setState(prevState => ({ entries: this.props.refData, [type]: !prevState[type] }));
    searchInputChanged = (event) => this.setState({ searchText: event.target.value, 'sets': true, 'maps': true, 'map_of_sets': true, 'tables': true });
    matchesCurrentSearch = (entry) => {
        // try to interpret current search string as Regex, if that fails, simply perform string matching
        try {
            return entry.match(new RegExp(this.state.searchText, 'i'));
        } catch (e) {
            return entry.toLowerCase().includes(this.state.searchText.toLowerCase());
        }
    }

    render() {
        return (
            <div className='menu' >
                <Search type='text' labelText={i18n.t('data.sidebar.search')} placeHolderText={i18n.t('data.sidebar.search')} light onChange={this.searchInputChanged} value={this.state.searchText} />
                <Accordion>
                    {
                        Object.keys(this.props.refData).map(type =>
                            <AccordionItem key={type} open={this.state[type]} title={this.props.refData[type].label} className='menu-title' onClick={() => this.toggleMenu(type)}>
                                <Button kind='primary' size='small' className='btn-create-new' onClick={(e) => this.props.createEntry(e, type)} key={'btn-' + type}>
                                    {i18n.t('data.sidebar.create')}
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