import React, { Component } from 'react';
import { ListGroupItem, ListGroup, Badge } from 'reactstrap';
import * as Formatters from '../Util/Formatters';

class MetaData extends Component {
    lookup = { 'map': 'Map', 'set': 'Set', 'map_of_sets': 'Map of Sets', 'table': 'Table', };
    
    render() {
        return (
            <React.Fragment>
                <button className='btn-default btn-delete btn-right btn-top' onClick={this.props.deleteEntry}>Delete {this.lookup[this.props.typeLabel] || 'Data'}</button>
                <button className='btn-default btn-delete btn-right btn-top-second' onClick={this.props.purgeData}>Clear Data</button>
                <div className='row ref-data-meta-data'>
                    <ListGroup flush>
                        <ListGroupItem className='ref-data-meta-data-title'>{this.props.data.name || 'Loading...'}</ListGroupItem>
                        <ListGroupItem>Number of Elements: <Badge color='primary' pill>{this.props.data.number_of_elements || 0}</Badge></ListGroupItem>
                        <ListGroupItem>Creation Time: {this.props.data.creation_time ? Formatters.dateFormatter(this.props.data.creation_time) : ''}</ListGroupItem>
                        <ListGroupItem>Timeout Type: {this.props.data.timeout_type}</ListGroupItem>
                        <ListGroupItem>Element Type: {this.props.data.element_type}</ListGroupItem>
                        <ListGroupItem>Time To Live: {this.props.data.time_to_live ? Formatters.ttlFormatter(this.props.data.time_to_live) : 'Infinitly'}</ListGroupItem>
                    </ListGroup>
                </div>
            </React.Fragment>
        );
    }
}

export default MetaData;
