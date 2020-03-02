import React from 'react';
import { DataTableSkeleton, DataTable } from 'carbon-components-react';
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
} = DataTable;

function Dependents(props) {
    let dependents;
    if (props.dependents && props.dependents.length > 0)
        dependents = props.dependents.map(dependent => ({ id: String(Math.random()), dependent: '(' + dependent.dependent_type + ')' + dependent.dependent_name }));
    else
        dependents = [{ id: '0', dependent: 'This ReferenceData appears to not have any data depending on it' }];

    return (
        props.loaded ?
            <DataTable
                className='ref-data-dependents'
                headers={[{ header: 'Dependents', key: 'dependent' }]}
                rows={dependents}
                useZebraStyles={true}
                render={({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                    <Table {...getTableProps()}>
                        <TableHead>
                            <TableRow>
                                {headers.map(header => (
                                    <TableHeader {...getHeaderProps({ header })}>
                                        {header.header}
                                    </TableHeader>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => (
                                <TableRow key={row.id} {...getRowProps({ row })}>
                                    {row.cells.map(cell => (
                                        <TableCell key={cell.id}>{cell.value}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            />
            :
            <DataTableSkeleton headers={['Dependents']} columnCount={1} rowCount={1} />
    );
}

export default Dependents;