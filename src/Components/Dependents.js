import React from 'react';
import { ListGroupItem, ListGroup } from 'reactstrap';
import { StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, StructuredListSkeleton } from 'carbon-components-react';


function Dependents(props) {
    let dependentRules;
    if (props.dependents && props.dependents.length > 0)
        dependentRules = props.dependents.map(dependent => (
            <StructuredListBody><StructuredListRow key={dependent.dependent_name}><StructuredListCell className='ref-data-dependents-entry'>
                ({dependent.dependent_type}) {dependent.dependent_name}
            </StructuredListCell></StructuredListRow></StructuredListBody>
        ));
    else
        dependentRules =
            <StructuredListBody><StructuredListRow key='No Items'><StructuredListCell className='ref-data-dependents-entry'>
                This ReferenceData appears to not have any data depending on it
            </StructuredListCell></StructuredListRow></StructuredListBody>;

    return (
        props.loaded ?
            <StructuredListWrapper className='ref-data-dependents'>
                <StructuredListHead>
                    <StructuredListRow head className='ref-data-dependents-title'>
                        <StructuredListCell head>Dependents:</StructuredListCell>
                    </StructuredListRow>
                </StructuredListHead >
                {dependentRules}
            </StructuredListWrapper >
            :
            <StructuredListSkeleton rowCount={1}/>
    );
}

export default Dependents;