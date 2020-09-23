import React, { useState } from 'react';
import { Search, Accordion, AccordionItem, Tag, Button, UnorderedList, SkeletonText, } from 'carbon-components-react';
import i18n from '../I18n/i18n';
import { ui01, ui05 } from '@carbon/themes';

function Sidebar(props) {
    const [searchText, setSearchText] = useState('');
    const [open, setOpen] = useState({});

    const toggleMenu = (type) => { setOpen({ ...open, [type]: !open[type] }) };
    const searchInputChanged = (event) => { setSearchText(event.target.value); setOpen({ 'sets': true, 'maps': true, 'map_of_sets': true, 'tables': true }) };
    const matchesCurrentSearch = (entry) => {
        // try to interpret current search string as Regex, if that fails, simply perform string matching
        try {
            return entry.match(new RegExp(searchText, 'i'));
        } catch (e) {
            return entry.toLowerCase().includes(searchText.toLowerCase());
        }
    }

    return (
        <div id='menu' role='region' aria-label='sidebar'>
            <Button kind='ghost' small defaultToggled id='switch-theme' onClick={() => props.updateTheme(true)}>Switch Theme</Button>
            <Search type='text' labelText={i18n.t('data.sidebar.search')} placeHolderText={i18n.t('data.sidebar.search')} light onChange={searchInputChanged} value={searchText} />
            <Accordion>
                {
                    Object.keys(props.refData).map(type =>
                        <AccordionItem key={type} open={open[type]} title={props.refData[type].label} className='menu-title' onClick={() => toggleMenu(type)}>
                            <Button kind='primary' size='small' className='btn-sidebar' onClick={(e) => props.createEntry(e, type)} key={'btn-' + type}>
                                {i18n.t('data.sidebar.create')}
                            </Button>
                            {type === 'sets' && <Button kind='primary' size='small' className='btn-sidebar' onClick={(e) => props.searchAll(e, type)} key={'btn-search-' + type}>
                                {i18n.t('data.sidebar.search.all')}
                            </Button>}
                            <UnorderedList className='menu-list'>
                                {
                                    props.refData[type].size === undefined // Require === undefined because there might be a data type where there are actually 0 entries
                                        ? <SkeletonText paragraph lineCount={3} heading />
                                        : Object.keys(props.refData[type].nodes).map(entryName => {
                                            if (matchesCurrentSearch(entryName)) {
                                                const entry = props.refData[type].nodes[entryName];
                                                return (
                                                    <Button kind='ghost' size='small' key={entry.label} className='menu-entry' onClick={(e) => props.menuItemAction(e, entry)} >
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

export default Sidebar;