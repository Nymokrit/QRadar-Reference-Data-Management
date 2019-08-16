import React, { Component } from 'react';
import { ListGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class InputModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entries: this.props.entries,
            filename: '',
            show: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidUpdate() {
        if (this.props.modal !== this.state.show) {
            this.setState({ entries: this.props.entries, show: this.props.modal, filename: '', });
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

    save() {
        this.props.save(this.state.entries);
        this.props.toggle();
    }

    render() {
        return (
            <Modal isOpen={this.props.modal} toggle={this.props.toggle} modalTransition={{ timeout: 0, }} backdrop={true} >
                <ModalHeader>{this.props.headerLabel || 'Add Entries'}</ModalHeader>
                <ModalBody>
                    {Object.keys(this.state.entries).map((key) => (
                        < ListGroup className='ref-data-input-modal-entry' key={key} >
                            <Label for='inputData'>{this.state.entries[key].label}
                                {this.state.entries[key].help &&
                                    <React.Fragment>
                                        &nbsp;<FontAwesomeIcon icon='question-circle' id={'input-data-label-' + key} />
                                        <UncontrolledTooltip placement='right' target={'input-data-label-' + key}>
                                            {this.state.entries[key].help}
                                        </UncontrolledTooltip>
                                    </React.Fragment>
                                }
                            </Label>
                            {
                                this.state.entries[key].type === 'file'
                                    ?
                                    <div className="file-upload"><label className="btn-default btn-import">
                                        <Input type={'file'} onChange={(e) => this.handleChange(e, key)} />
                                        Upload File
                                </label>
                                        <span className="file-name">{this.state.filename}</span>
                                    </div>
                                    :
                                    <Input
                                        type={this.state.entries[key].type || 'text'}
                                        id={key}
                                        value={this.state.entries[key].value}
                                        onChange={(e) => this.handleChange(e, key)}
                                    />
                            }
                        </ListGroup>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <button className='btn-default btn-ref-data-input btn-close' onClick={this.props.toggle}>Close</button>
                    <button className='btn-default btn-ref-data-input btn-save' onClick={(this.save)}>{this.props.saveLabel || 'Save'}</button>{' '}
                </ModalFooter>
            </Modal >
        );
    }
}

export default InputModal;