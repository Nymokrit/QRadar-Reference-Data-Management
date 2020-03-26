import React, { Component } from 'react';
import * as Formatters from '../Util/Formatters';
import { Button, Tag, StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, StructuredListSkeleton } from 'carbon-components-react';
import i18n from '../I18n/i18n';
import { Renew16 } from '@carbon/icons-react';

class MetaData extends Component {
    render() {
        const entries = [
            <>{i18n.t('data.meta.elements.count')}: <Tag type='gray'>{this.props.data.number_of_elements || 0}</Tag></>,
            <>{i18n.t('data.meta.elements.creation')}: {this.props.data.creation_time ? Formatters.dateFormatter(this.props.data.creation_time) : ''}</>,
            <>{i18n.t('data.meta.elements.timeout')}: {this.props.data.timeout_type}</>,
            <>{i18n.t('data.meta.elements.ttl')}: {this.props.data.time_to_live ? Formatters.ttlFormatter(this.props.data.time_to_live) : i18n.t('data.meta.elements.ttl.forever')}</>,
            <>{i18n.t('data.meta.elements.type.value')}: {this.props.data.element_type}</>,
        ];

        let keyTypes = this.props.data.key_name_types && '';
        if (keyTypes !== undefined) {
            for (const key in this.props.data.key_name_types) {
                keyTypes += this.props.data.key_name_types[key] + ' (' + key + '), ';
            }
            entries.splice(4, 0, <>{i18n.t('data.meta.elements.types.key')}: {keyTypes}</>);
        }

        return (
            <React.Fragment>
                <Button kind='danger' size='small' className='delete top right' onClick={this.props.deleteEntry}>{i18n.t('data.table.elements.delete.' + this.props.typeLabel)}</Button>
                <Button kind='danger' size='small' className='delete top-second right' onClick={this.props.purgeData}>{i18n.t('data.meta.elements.purge')}</Button>
                {
                    this.props.data.name ?
                        <StructuredListWrapper className='meta-data'>
                            <StructuredListHead><StructuredListRow head>
                                <StructuredListCell head className='meta-data-title'>{this.props.data.name}<Button className='reload' onClick={this.props.reload} kind='ghost' size='small' tooltipPosition='bottom' renderIcon={Renew16} iconDescription='Refresh' /></StructuredListCell>
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
