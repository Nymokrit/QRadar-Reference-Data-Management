import React, { Component } from 'react';
import { Label, Input, Tooltip, InputGroup, InputGroupAddon, InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as EntryDefinitions from '../Definitions/ReferenceDataCreateEntryDefinitions';

class ReferenceDataNewEntry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: this.props.type,
            entries: JSON.parse(JSON.stringify(EntryDefinitions[this.props.type])),
        };

        this.typeLookup = { tables: 'Table', map_of_sets: 'Map of Sets', sets: 'Set', maps: 'Map', };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate() {
        if (this.state.type !== this.props.type) {
            this.setState({
                type: this.props.type,
                entries: JSON.parse(JSON.stringify(EntryDefinitions[this.props.type])),
            });
        }
    }

    handleChange(event, target) {
        const entries = this.state.entries;
        entries[target].value = event.target.value;
        this.setState({ entries: entries, });
    }

    render() {
        return (
            <div className='ref-data-create-entry'>
                <b>Add new Reference {this.typeLookup[this.state.type]} to Database</b>
                <div>
                    {Object.keys(this.state.entries).map((key) => {
                        let inputField = <Input type={this.state.entries[key].type || 'text'} id={key} value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)} />;
                        if (this.state.entries[key].type === 'select') {
                            inputField = (<Input type='select' value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)}>
                                {this.state.entries[key].options.map(entry => (<option key={entry}>{entry}</option>))}
                            </Input>);
                        } else if (this.state.entries[key].type === 'list') {
                            inputField = (<ListInput options={this.state.entries[key].options} label={this.state.entries[key].label} values={this.state.entries[key].values} />);
                        } else if (this.state.entries[key].type === 'date') {
                            inputField = (<TimeInput options={this.state.entries[key].options} label={this.state.entries[key].label} setValue={e => this.state.entries[key].value = e} />);
                        }
                        return (
                            <div key={key} className='ref-data-create-entry-element'>
                                <Label for='inputData'>{this.state.entries[key].label}</Label>
                                &nbsp;<i id={'tooltip' + key} className='fas fa-question-circle'></i>
                                <Tooltip isOpen={this.state['tooltip' + key]} target={'tooltip' + key} toggle={(e) => this.setState({ [e.target.id]: !this.state[e.target.id], })}>
                                    {this.state.entries[key].help || 'Help will arrive soon'}
                                </Tooltip>
                                {inputField}
                            </div>
                        );
                    })}
                    <button className='btn-default btn-ref-data btn-add' onClick={(e) => this.props.save(this.state.entries)}>Create</button>
                </div>
            </div>);
    }
}

class ListInput extends Component {
    constructor(props) {
        super(props);

        this.addInnerKey = this.addInnerKey.bind(this);

        const inputLabels = {};
        Object.keys(this.props.values).forEach((label) => { inputLabels[label] = this.props.values[label]; });

        this.state = { entries: inputLabels, nextKeyValue: 2, };
    }

    handleChange(event, key, target) {
        const entries = this.state.entries;
        entries[key][target] = event.target.value || event.target.text;
        this.setState({ entries: entries, });

        this.props.values[key][target] = event.target.value;
    }

    addInnerKey(e) {
        const defaultText = 'Inner Key ' + (this.state.nextKeyValue);

        const entries = this.state.entries;
        entries[defaultText] = { label: defaultText, type: 'ALN', };
        this.setState({ entries: entries, nextKeyValue: this.state.nextKeyValue + 1, });

        this.props.values[defaultText] = { label: defaultText, type: 'ALN', };
    }

    removeInnerKey(key) {
        const entries = this.state.entries;
        delete entries[key];
        this.setState({ entries: entries, });

        delete this.props.values[key];
    }

    toggleDropDown(entry) {
        const entries = this.state.entries;
        entries[entry].elemTypeDropdownState = !entries[entry].elemTypeDropdownState;
        this.setState({ entries: entries, });
    }

    render() {
        return (
            <div className='inner-keys'>
                {
                    Object.keys(this.state.entries).map(entry => (
                        <InputGroup className='inner-keys-inputs' key={entry}>
                            <InputGroupButtonDropdown addonType='prepend' isOpen={this.state.entries[entry].elemTypeDropdownState} toggle={(e) => this.toggleDropDown(entry)}>
                                <DropdownToggle className='btn-default btn-add-inner-keys' caret>
                                    {this.state.entries[entry].type}
                                </DropdownToggle>
                                <DropdownMenu onClick={(e) => this.handleChange(e, entry, 'type')}>
                                    {this.props.options.map(entry => (<DropdownItem value={entry} key={'bu' + entry}>{entry}</DropdownItem>))}
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input key={entry} value={this.state.entries[entry].label} onChange={(e) => this.handleChange(e, entry, 'label')} />
                            <InputGroupAddon addonType='append'>
                                <button className='btn-default btn-ref-data btn-delete-subitem' onClick={(e) => this.removeInnerKey(entry)}>
                                    <FontAwesomeIcon icon='trash' />
                                </button>
                            </InputGroupAddon>
                        </InputGroup>
                    )
                    )
                }
                <button className='btn-default btn-ref-data btn-bulk' onClick={(e) => this.addInnerKey(e)}>Add Inner Key</button>
            </div>
        );
    }
}


class TimeInput extends Component {
    constructor(props) {
        super(props);

        this.state = { label: '', type: 'days' }
    }

    handleChange(event, target) {
        let newState = ''
        if (target === 'label') {
            newState = event.target.value + ' ' + this.state.type;
            this.setState({ label: event.target.value });
        } else if (target === 'type') {
            newState = this.state.label + ' ' + event.target.value;
            this.setState({ type: event.target.value });
        }

        this.props.setValue(newState);
    }

    toggleDropDown() {
        this.setState(prevState => ({ elemTypeDropdownState: !prevState.elemTypeDropdownState, }));
    }

    render() {
        return (
            <div className='inner-keys'>
                {
                    <InputGroup className='inner-keys-inputs'>
                        <Input value={this.state.label} onChange={(e) => this.handleChange(e, 'label')} />
                        <InputGroupButtonDropdown addonType='append' isOpen={this.state.elemTypeDropdownState} toggle={(e) => this.toggleDropDown()}>
                            <DropdownToggle className='btn-default btn-add-inner-keys' caret>
                                {this.state.type}
                            </DropdownToggle>
                            <DropdownMenu onClick={(e) => this.handleChange(e, 'type')}>
                                {this.props.options.map(entry => (<DropdownItem value={entry} key={'bu' + entry}>{entry}</DropdownItem>))}
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                    </InputGroup>
                }
            </div>
        );
    }
}

export default ReferenceDataNewEntry;