import React from 'react';
import { ListGroupItem, ListGroup } from 'reactstrap';

function ReferenceDataDependents(props) {
    let dependentRules;
    if (props.dependents && props.dependents.length > 0)
        dependentRules = props.dependents.map(dependent => (
            <ListGroupItem
                className='ref-data-dependents-entry'
                key={dependent.dependent_name}
            >
                ({dependent.dependent_type}) {dependent.dependent_name}
            </ListGroupItem>
        ));
    else
        dependentRules =
            <ListGroupItem
                className='ref-data-dependents-entry'
                key='No Items'
            >
                This ReferenceData appears to not have any data depending on it
            </ListGroupItem>;

    return (
        <ListGroup className='ref-data-dependents'>
            <ListGroupItem className='ref-data-dependents-title'>Dependents:</ListGroupItem>
            {dependentRules}
        </ListGroup>
    );
}

export default ReferenceDataDependents;