import React, { Component } from 'react';
import * as Formatters from '../Util/Formatters';
import { Button, Tag, StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, StructuredListSkeleton } from 'carbon-components-react';

class MetaData extends Component {
    typeLookup = { map: 'Map', set: 'Set', map_of_sets: 'Map of Sets', table: 'Table', };

    render() {
        const entries = [
            <>Number of Elements: <Tag type='gray'>{this.props.data.number_of_elements || 0}</Tag></>,
            <>Creation Time: {this.props.data.creation_time ? Formatters.dateFormatter(this.props.data.creation_time) : ''}</>,
            <>Timeout Type: {this.props.data.timeout_type}</>,
            <>Value Type: {this.props.data.element_type}</>,
            <>Time To Live: {this.props.data.time_to_live ? Formatters.ttlFormatter(this.props.data.time_to_live) : 'Infinitly'}</>,
        ];

        let keyTypes = this.props.data.key_name_types && '';
        if (keyTypes !== undefined) {
            for (const key in this.props.data.key_name_types) {
                keyTypes += this.props.data.key_name_types[key] + ' (' + key + '), ';
            }
            entries.splice(3, 0, <>Key Types: {keyTypes}</>);
        }

        return (
            <React.Fragment>
                <Button kind='danger' size='small' className='delete top right' onClick={this.props.deleteEntry}>Delete {this.typeLookup[this.props.typeLabel] || 'Data'}</Button>
                <Button kind='danger' size='small' className='delete top-second right' onClick={this.props.purgeData}>Clear Data</Button>
                {
                    this.props.data.name ?
                        <StructuredListWrapper className='meta-data'>
                            <StructuredListHead><StructuredListRow head>
                                <StructuredListCell head className='meta-data-title'>{this.props.data.name}</StructuredListCell>
                            </StructuredListRow>
                            </StructuredListHead>
                            <StructuredListBody>
                                {entries.map((entry, index) =>
                                    <StructuredListRow key={index}><StructuredListCell className='meta-data-entry'>
                                        {entry}
                                    </StructuredListCell></StructuredListRow>
                                )}
                            </StructuredListBody>
                        </StructuredListWrapper>
                        :
                        <StructuredListSkeleton className='meta-data' />
                }
            </React.Fragment>
        );
    }
}

export default MetaData;
