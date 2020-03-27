import React from 'react';
import * as Formatters from '../Util/Formatters';
import { Button, Tag, StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, StructuredListSkeleton } from 'carbon-components-react';
import i18n from '../I18n/i18n';
import { Renew16 } from '@carbon/icons-react';

function MetaData(props) {
    const entries = [
        <>{i18n.t('data.meta.elements.count')}: <Tag type='gray'>{props.data.number_of_elements || 0}</Tag></>,
        <>{i18n.t('data.meta.elements.creation')}: {props.data.creation_time ? Formatters.dateFormatter(props.data.creation_time) : ''}</>,
        <>{i18n.t('data.meta.elements.timeout')}: {props.data.timeout_type}</>,
        <>{i18n.t('data.meta.elements.ttl')}: {props.data.time_to_live ? Formatters.ttlFormatter(props.data.time_to_live) : i18n.t('data.meta.elements.ttl.forever')}</>,
        <>{i18n.t('data.meta.elements.type.value')}: {props.data.element_type}</>,
    ];

    let keyTypes = props.data.key_name_types && '';
    if (keyTypes !== undefined) {
        for (const key in props.data.key_name_types) {
            keyTypes += props.data.key_name_types[key] + ' (' + key + '), ';
        }
        entries.splice(4, 0, <>{i18n.t('data.meta.elements.types.key')}: {keyTypes}</>);
    }

    return (
        <React.Fragment>
            <Button kind='danger' size='small' className='delete top right' onClick={props.deleteEntry}>{i18n.t('data.table.elements.delete.' + props.typeLabel)}</Button>
            <Button kind='danger' size='small' className='delete top-second right' onClick={props.purgeData}>{i18n.t('data.meta.elements.purge')}</Button>
            {
                props.data.name ?
                    <StructuredListWrapper className='meta-data'>
                        <StructuredListHead><StructuredListRow head>
                            <StructuredListCell head className='meta-data-title'>{props.data.name}<Button className='reload' onClick={props.reload} kind='ghost' size='small' tooltipPosition='bottom' renderIcon={Renew16} iconDescription='Refresh' /></StructuredListCell>
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

export default MetaData;
