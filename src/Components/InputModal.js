import React, { Component } from 'react';
import { Checkbox, FormLabel, Tooltip, Modal, TextInput, TextArea, FileUploaderDropContainer, StructuredListWrapper, StructuredListBody, StructuredListRow } from 'carbon-components-react';
import i18n from '../I18n/i18n';

/**
 * Responsible for displaying the input modal for the 'add value' functions (add, bulk add, import).
 * A modal is shown containing the relevant fields which are coming either from the ReferenceDataCreateEntryDefinitions or are dyinamically loaded (for tables where inner keys change)
 */
class InputModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entries: this.props.entries,
            filename: '',
            show: false,
        };
    }

    componentDidUpdate() {
        // We need this because the modal needs to reset entries definitions after each show/close
        if (this.props.modal !== this.state.show) this.setState({ entries: JSON.parse(JSON.stringify(this.props.entries)), show: this.props.modal, filename: '', });
    }

    handleChange = (event, target, files) => {
        const entries = this.state.entries;
        let filename = this.state.filename;
        if (files) {
            entries[target].value = files.addedFiles[0];
            filename = files.addedFiles[0].name;
        } else if (entries[target].type === 'checkbox') {
            entries[target].value = event;
        } else {
            entries[target].value = event.target.value;
        }
        this.setState({ entries: entries, filename: filename, });
    }

    /**
     * If the current element contains some help text, we display this as a tooltip to the right. Help is optional so not every element will have one.
     * @param {*} key Element of Entries
     */
    label(key) {
        return (this.state.entries[key].help) ?
            <Tooltip direction='right' triggerText={this.state.entries[key].label}>
                {this.state.entries[key].help}
            </Tooltip>
            :
            <FormLabel>{this.state.entries[key].label}</FormLabel>
    }

    render() {
        const defaultFileUploadText = i18n.t('data.table.elements.add.file.placeholder');

        return (
            <Modal
                size='sm'
                open={this.props.modal}
                onRequestSubmit={() => { this.props.save(this.state.entries); this.props.closeModal() }}
                onRequestClose={this.props.closeModal}
                modalHeading={i18n.t('data.table.elements.add.title')}
                primaryButtonText={i18n.t('data.table.elements.add.save')}
                secondaryButtonText={i18n.t('data.table.elements.add.close')}
            >
                <StructuredListWrapper id='input-modal'>
                    <StructuredListBody>
                        {Object.keys(this.state.entries).map((key) =>
                            <StructuredListRow className='input-modal-entry'>
                                {
                                    {
                                        file: <FileUploaderDropContainer id={key} multiple={false} labelText={this.state.filename || defaultFileUploadText} onAddFiles={(e, files) => this.handleChange(e, key, files)} />,
                                        text: <TextInput id={key} labelText={this.label(key)} value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)} />,
                                        textarea: <TextArea id={key} labelText={this.label(key)} value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)} />,
                                        checkbox: <Checkbox defaultChecked id={key} labelText={this.label(key)} value={this.state.entries[key].value} onChange={(e) => this.handleChange(e, key)} />
                                    }[this.state.entries[key].type]
                                }
                            </StructuredListRow>
                        )
                        }
                    </StructuredListBody>
                </StructuredListWrapper>

            </Modal>
        );
    }
}

export default InputModal;