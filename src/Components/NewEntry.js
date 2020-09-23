import React, { Component, useState } from 'react';

import * as EntryDefinitions from '../Definitions/ReferenceDataCreateEntryDefinitions';

import { Button, TextInput, Form, FormGroup, Dropdown, FormLabel, Tooltip } from 'carbon-components-react';
import { Delete16 } from '@carbon/icons-react';
import i18n from '../I18n/i18n';


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
                <FormGroup legendText={i18n.t('data.new.title', { type: this.typeLookup[this.state.type] })} />
                {Object.keys(this.state.entries).map((key) => {
                    let inputField;
                    switch (this.state.entries[key].type) {
                        case 'select':
                            inputField = <Dropdown id={key} selectedItem={this.state.entries[key].value} onChange={(e) => this.handleDropdownChange(e, key)} items={this.state.entries[key].options} />;
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
                        <FormGroup key={key} legendText={key}>
                            {this.state.entries[key].help ?
                                <Tooltip direction='right' triggerText={this.state.entries[key].label}>{this.state.entries[key].help}</Tooltip>
                                :
                                <FormLabel>{this.state.entries[key].label}</FormLabel>
                            }
                            {inputField}
                        </FormGroup>
                    );
                })}
                <Button kind='primary' size='small' onClick={() => this.props.save(this.state.entries)} >{i18n.t('data.new.create')}</Button>
            </Form>);
    }
}

function ListInput(props) {
    const inputLabels = {};
    Object.keys(props.values).forEach((label) => { inputLabels[label] = props.values[label]; });

    const [nextKeyValue, setNextKeyValue] = useState(2);
    const [entries, setEntries] = useState(inputLabels);

    const handleChange = (event, key, target) => {
        const value = event.target.value;
        setEntries({ ...entries, [key]: { [target]: value } });

        props.values[key][target] = value;
    }

    const handleDropdownChange = (event, key, target) => {
        const value = event.selectedItem;
        setEntries({ ...entries, [key]: { [target]: value } });

        props.values[key][target] = value;
    }

    const addInnerKey = (e) => {
        const defaultText = 'Inner Key ' + (nextKeyValue);

        setEntries({ ...entries, [defaultText]: { label: defaultText, type: 'ALN', } });
        setNextKeyValue(nextKeyValue + 1);

        props.values[defaultText] = { label: defaultText, type: 'ALN', };
    }

    const removeInnerKey = (key) => {
        delete entries[key];
        setEntries({ ...entries });

        delete props.values[key];
    }


    return (
        <div className='inner-keys'>
            {
                Object.keys(entries).map(entry => (
                    <div className='input-group' key={entry}>
                        <Dropdown className='create-new-dropdown' items={props.options} selectedItem={entries[entry].type} onChange={(e) => handleDropdownChange(e, entry, 'type')} />
                        <TextInput key={entry} value={entries[entry].label} onChange={(e) => handleChange(e, entry, 'label')} />
                        <Button kind='danger' size='small' hasIconOnly renderIcon={Delete16} iconDescription='Delete' tooltipPosition='bottom' className='delete-inner-key' onClick={(e) => removeInnerKey(entry)}></Button>
                    </div>
                )
                )
            }
            <Button kind='tertiary' size='small' onClick={(e) => addInnerKey(e)}>{i18n.t('data.new.add.key.inner')}</Button>
        </div>
    );

}


function TimeInput(props) {
    const [label, setLabel] = useState();
    const [type, setType] = useState('days');

    const handleChange = (event) => {
        let input = '';
        if (event.target.value) input = event.target.value + ' ' + type;
        setLabel(event.target.value);
        props.setValue(input);
    }

    const handleDropdownChange = (event) => {
        const input = label + ' ' + event.selectedItem;
        setType(event.selectedItem);
        props.setValue(input);
    }

    return (
        <div className='inner-keys'>
            <div className='input-group'>
                <TextInput value={label} onChange={(e) => handleChange(e)} />
                <Dropdown className='create-new-dropdown' selectedItem={type} onChange={(e) => handleDropdownChange(e)} items={props.options} />
            </div>
        </div>
    );

}

export default NewEntry;