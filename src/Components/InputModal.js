import React, { Component } from 'react';
import { ListGroup, Label, Input, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FormLabel, Tooltip, Modal, TextInput, TextArea, FileUploaderDropContainer, StructuredListWrapper, StructuredListBody, StructuredListRow } from 'carbon-components-react';

class InputModal extends Component {
    constructor(props) {
        super(props);
        console.log(this.props);

        this.state = {
            entries: this.props.entries,
            filename: '',
            show: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidUpdate() {
        // We need this because the modal needs to reset entries definitions after each show/close
        if (this.props.modal !== this.state.show) {
            console.log(this.props.entries);
            this.setState({ entries: JSON.parse(JSON.stringify(this.props.entries)), show: this.props.modal, filename: '', });
        }
    }

    handleChange(event, target) {
        const entries = this.state.entries;
        let filename = this.state.filename;
        if (event.target.type === 'file') {
            entries[target].value = event.target.files.item(0);
            filename = event.target.files.item(0).name;
        }
        else entries[target].value = event.target.value;
        this.setState({ entries: entries, filename: filename, });
    }

    save(e) {
        this.props.save(this.state.entries);
        this.closeModal(e);
    }

    closeModal(e) {
        this.setState({
            entries: JSON.parse(JSON.stringify(this.props.entries)),
            filename: '',
            show: false,
        });
        this.props.closeModal();
    }

    render() {
        return (
            <Modal
                size='sm'
                open={this.props.modal}
                onRequestSubmit={this.save}
                onRequestClose={this.closeModal}
                modalHeading={this.props.headerLabel || 'Add Entries'}
                primaryButtonText={this.props.saveLabel || 'Save'}
                secondaryButtonText='Close'
            >
                {Object.keys(this.state.entries).map((key) => (
                    < StructuredListWrapper className='ref-data-input-modal-entry' key={key} >
                        <StructuredListBody>
                            <StructuredListRow>
                                {this.state.entries[key].help ?
                                    <Tooltip direction='right' triggerText={this.state.entries[key].label}>
                                        {this.state.entries[key].help}
                                    </Tooltip>
                                    :
                                    <FormLabel>{this.state.entries[key].label}</FormLabel>
                                }
                            </StructuredListRow>
                            <StructuredListRow>
                                {
                                    this.state.entries[key].type === 'file'
                                    &&
                                    <FileUploaderDropContainer
                                        labelText={this.state.filename || "Drag and drop file here or click to upload"}
                                        onChange={(e) => this.handleChange(e, key)}
                                    />
                                }{
                                    this.state.entries[key].type === 'text'
                                    &&
                                    <TextInput id={key} onChange={(e) => this.handleChange(e, key)} value={this.state.entries[key].value} />
                                }{this.state.entries[key].type === 'textarea' &&
                                    <TextArea
                                        id={key}
                                        value={this.state.entries[key].value}
                                        onChange={(e) => this.handleChange(e, key)}
                                    />
                                }{this.state.entries[key].type === 'select' &&
                                    <Input
                                        type={this.state.entries[key].type}
                                        id={key}
                                        value={this.state.entries[key].value}
                                        onChange={(e) => this.handleChange(e, key)}
                                    />
                                }
                            </StructuredListRow>
                        </StructuredListBody>
                    </StructuredListWrapper>
                ))
                }

            </Modal>
        );
    }
}

export default InputModal;