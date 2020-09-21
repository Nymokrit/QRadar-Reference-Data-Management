import React from 'react';
import { DataTableSkeleton, DataTable, Link } from 'carbon-components-react';
import i18n from '../I18n/i18n';
const {
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
} = DataTable;

function Dependents(props) {
    let dependents;
    if (props.dependents && props.dependents.length > 0) {
        // Remove duplicate entries from the API
        dependents = props.dependents.filter((value, index, self) => self.findIndex(temp => (temp.dependent_id === value.dependent_id)) === index);
        // map to a readable format
        dependents = dependents.map((dependent, i) => ({ id: i, dependent: '(' + dependent.dependent_type + ') ' + dependent.dependent_name }));
    } else
        dependents = [{ id: '0', dependent: i18n.t('data.dependents.none'), },];

    return (
        props.loaded ?
            <DataTable
                headers={[{ header: i18n.t('data.dependents.title'), key: 'dependent', },]}
                rows={dependents}
                useZebraStyles={true}
                render={({ rows, headers, getTableProps, getHeaderProps, getRowProps, }) => (
                    <Table {...getTableProps()}>
                        <TableHead>
                            <TableRow>
                                {headers.map(header => (
                                    <TableHeader {...getHeaderProps({ header, })}>
                                        {header.header}
                                    </TableHeader>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => (
                                <TableRow key={row.id} {...getRowProps({ row, })}>
                                    {row.cells.map(cell => (
                                        <TableCell key={cell.id}>
                                            {
                                                props.dependents && props.dependents.length && ['CRE_RULE', 'BUILDING_BLOCK', 'ADE_RULE'].includes(props.dependents[row.id].dependent_type)
                                                    ?
                                                    <Link href='#' onClick={e => { e.preventDefault(); props.editRule(props.dependents[row.id].dependent_id) }}>{cell.value}</Link>
                                                    :
                                                    <label>{cell.value}</label>
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            />
            :
            <DataTableSkeleton headers={[i18n.t('data.dependents.title'),]} columnCount={1} rowCount={1} />
    );
}

export default Dependents;

