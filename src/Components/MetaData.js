import React, { Component } from 'react';
import { ListGroupItem, ListGroup, Badge } from 'reactstrap';
import * as Formatters from '../Util/Formatters';
import { Button, Tag, StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, StructuredListSkeleton } from 'carbon-components-react';

class MetaData extends Component {
    lookup = { 'map': 'Map', 'set': 'Set', 'map_of_sets': 'Map of Sets', 'table': 'Table', };

    render() {
        let keyTypes = this.props.data.key_name_types && "";
        if (keyTypes !== undefined) {
            for (const key in this.props.data.key_name_types) {
                keyTypes += this.props.data.key_name_types[key] + ' (' + key + '), ';
            }
        }
        return (
            this.props.data.name ?
                <StructuredListWrapper className='ref-data-meta-data'>
                    <Button kind='danger' size='small' className='btn-default btn-delete btn-right btn-top' onClick={this.props.deleteEntry}>Delete {this.lookup[this.props.typeLabel] || 'Data'}</Button>
                    <Button kind='danger' size='small' className='btn-default btn-delete btn-right btn-top-second' onClick={this.props.purgeData}>Clear Data</Button>
                    <StructuredListHead><StructuredListRow head>
                        <StructuredListCell head className='ref-data-meta-data-title'>{this.props.data.name}</StructuredListCell>
                    </StructuredListRow>
                    </StructuredListHead>
                    <StructuredListBody>
                        <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry'>
                            Number of Elements: <Tag type='gray'>{this.props.data.number_of_elements || 0}</Tag>
                        </StructuredListCell></StructuredListRow>
                        <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry'>
                            Creation Time: {this.props.data.creation_time ? Formatters.dateFormatter(this.props.data.creation_time) : ''}
                        </StructuredListCell></StructuredListRow>
                        <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry'>
                            Timeout Type: {this.props.data.timeout_type}
                        </StructuredListCell></StructuredListRow>
                        {keyTypes && <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry'>
                            Key Types: {keyTypes}
                        </StructuredListCell></StructuredListRow>}
                        <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry'>
                            Value Type: {this.props.data.element_type}
                        </StructuredListCell></StructuredListRow>
                        <StructuredListRow><StructuredListCell className='ref-data-meta-data-entry' F>
                            Time To Live: {this.props.data.time_to_live ? Formatters.ttlFormatter(this.props.data.time_to_live) : 'Infinitly'}
                        </StructuredListCell></StructuredListRow>
                    </StructuredListBody>
                </StructuredListWrapper>
                :
                <StructuredListSkeleton className='ref-data-meta-data' />
        );
    }
}

export default MetaData;
