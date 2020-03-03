import React, { Component } from 'react';

import * as EntryDefinitions from '../Definitions/ReferenceDataCreateEntryDefinitions';

import { Button, TextInput, Form, FormGroup, Dropdown, FormLabel, Tooltip } from 'carbon-components-react';
import { Delete16 } from '@carbon/icons-react';


class NewEntry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: this.props.type,
            entries: JSON.parse(JSON.stringify(EntryDefinitions[this.props.type])),
        };

        this.typeLookup = { tables: 'Table', map_of_sets: 'Map of Sets', sets: 'Set', maps: 'Map', };
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

    handleDropdownChange(event, target) {
        const entries = this.state.entries;
        entries[target].value = event.selectedItem;
        this.setState({ entries: entries, });
    }

    render() {
        return (
            <Form>
                <FormGroup legendText={'Add new Reference ' + this.typeLookup[this.state.type] + ' to Database'} />
                {Object.keys(this.state.entries).map((key) => {
                    let inputField;
                    switch (this.state.entries[key].type) {
                        case 'select':
                            inputField = <Dropdown selectedItem={this.state.entries[key].value} onChange={(e) => this.handleDropdownChange(e, key)} items={this.state.entries[key].options} />;
                            break;
                        case 'list':
                            inputField = <ListInput options={this.state.entries[key].options} label={this.state.entries[key].label} values={this.state.entries[key].values} />;
                            break;
                        case 'date':
                            inputField = <TimeInput options={this.state.entries[key].options} label={this.state.entries[key].label} setValue={e => this.state.entries[key].value = e} />;
                            break;
                        default:
                            inputField = <TextInput id={key} value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)} />;
                    }

                    return (
                        <FormGroup key={key}>
                            {this.state.entries[key].help ?
                                <Tooltip direction='right' triggerText={this.state.entries[key].label}>{this.state.entries[key].help}</Tooltip>
                                :
                                <FormLabel>{this.state.entries[key].label}</FormLabel>
                            }
                            {inputField}
                        </FormGroup>
                    );
                })}
                <Button kind='primary' size='small' onClick={() => this.props.save(this.state.entries)} >Create</Button>
            </Form>);
    }
}

class ListInput extends Component {
    constructor(props) {
        super(props);

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

    handleDropdownChange(event, key, target) {
        const entries = this.state.entries;
        entries[key][target] = event.selectedItem;
        this.setState({ entries: entries, });

        this.props.values[key][target] = event.selectedItem;
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

    render() {
        return (
            <div className='inner-keys'>
                {
                    Object.keys(this.state.entries).map(entry => (
                        <div className='input-group' key={entry}>
                            <Dropdown items={this.props.options} selectedItem={this.state.entries[entry].type} onChange={(e) => this.handleDropdownChange(e, entry, 'type')} />
                            <TextInput key={entry} value={this.state.entries[entry].label} onChange={(e) => this.handleChange(e, entry, 'label')} />
                            <Button kind='danger' size='small' hasIconOnly renderIcon={Delete16} iconDescription='Delete' tooltipPosition='bottom' className='delete-inner-key' onClick={(e) => this.removeInnerKey(entry)}></Button>
                        </div>
                    )
                    )
                }
                <Button kind='tertiary' size='small' onClick={(e) => this.addInnerKey(e)}>Add Inner Key</Button>
            </div>
        );
    }
}


class TimeInput extends Component {
    constructor(props) {
        super(props);

        this.state = { label: '', type: 'days', };
    }

    handleChange(event) {
        let newState = '';
        if (event.target.value) newState = event.target.value + ' ' + this.state.type;
        this.setState({ label: event.target.value, });
        this.props.setValue(newState);
    }

    handleDropdownChange(event) {
        const newState = this.state.label + ' ' + event.selectedItem;
        this.setState({ type: event.selectedItem, });
        this.props.setValue(newState);
    }

    render() {
        return (
            <div className='inner-keys'>
                <div className='input-group'>
                    <TextInput value={this.state.label} onChange={(e) => this.handleChange(e)} />
                    <Dropdown selectedItem={this.state.type} onChange={(e) => this.handleDropdownChange(e)} items={this.props.options} />
                </div>
            </div>
        );
    }
}

export default NewEntry;