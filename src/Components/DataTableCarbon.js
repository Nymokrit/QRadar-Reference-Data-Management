import React, { Component } from 'react';

import { Delete24 } from '@carbon/icons-react';
import { Button, DataTable, TableExpandHeader, TableExpandRow, TableExpandedRow, Pagination } from 'carbon-components-react';

const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableToolbar,
    TableSelectAll,
    TableSelectRow,
    TableBatchActions,
    TableBatchAction,
    TableToolbarContent,
    TableToolbarSearch,
} = DataTable;

class DataTableCarbon extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: [], currentPageSize: 10, firstRowIndex: 0, currentPage: 1, updatePagination: Math.random(), sortDirection: 'ASC'
        };

        /* if (this.props.innerTable) this.props.selectionClearedCallback(this.props.parent.key, this.clearSelection);
        else this.props.selectionClearedCallback(this.clearSelection); */
    }

    handleOnSelect = (row, isSelect) => {
        let selected;
        if (isSelect) selected = [...this.state.selected, row.id,];
        else selected = this.state.selected.filter(x => x !== row.id);

        this.setState({ selected, });
        if (this.props.innerTable) this.props.selectionChanged(row.outer_key || row.key, selected);
        else this.props.selectionChanged(selected);

    }

    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r.id);

        let selected;
        if (isSelect) selected = ids;
        else selected = [];

        this.setState({ selected, });
        if (this.props.innerTable) this.props.selectionChanged(rows[0].outer_key || rows[0].key, selected);
        else this.props.selectionChanged(selected);
    }

    onInputChange = (event) => {
        this.props.tableChanged('search', { searchText: event.target.value });
        this.setState({ firstRowIndex: 0, currentPage: 1, updatePagination: Math.random() });
    }

    // Because the default sorting of the table doesn't work with pagination, we need to hook into the sorting and overwrite it
    // We store current sorting information as state information (direction + header) and sort the props.data inplace
    sortTable = (key) => {
        let newDirection = 'ASC';
        if (key === this.state.sortHeader) // The last sorting was for the same key, so we need to switch to the next sorting direction
            newDirection = this.state.sortDirection === 'ASC' ? 'DESC' : 'ASC'

        const comp = { 'ASC': [-1, 1], 'DESC': [1, -1] }; // Change sorting direction based on newDirection key
        this.props.data.sort((a, b) => (a[key] < b[key] ? comp[newDirection][0] : comp[newDirection][1]));

        this.setState({
            sortDirection: newDirection,
            sortHeader: key,
        });
    }



    render() {
        // Due to pagination, we only display a certain subset of the original dataset
        const data = this.props.data.slice(
            this.state.firstRowIndex,
            this.state.firstRowIndex + this.state.currentPageSize
        );


        const expandRow = (row) => {
            console.log(row);
            return (<div className='inner-table'>
                <DataTableCarbon
                    innerTable={true}
                    parent={row}
                    data={row.values}
                    columns={this.props.extendableColumns}
                    addItem={(e) => this.props.addInnerItem(row)}
                    deleteItem={(e) => this.props.deleteInnerItem(row)}
                    searchText={this.props.innerSearchText}
                />
            </div>);
        };

        return (
            <DataTable
                useZebraStyles={true}
                isSortable
                rows={data}
                headers={this.props.columns}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getRowProps,
                    getTableProps,
                    getSelectionProps,
                    getBatchActionProps,
                    selectedRows
                }) => (
                        <TableContainer>
                            <TableToolbar>
                                <TableBatchActions {...getBatchActionProps()}>
                                    <TableBatchAction renderIcon={Delete24} onClick={(e) => this.props.deleteItem(selectedRows)}>Delete</TableBatchAction>
                                </TableBatchActions>
                                <TableToolbarContent>
                                    {!this.props.innerTable && <TableToolbarSearch onChange={this.onInputChange} />}{ /* We only display a search bar for the outer table since we don't expect many inner values anyways */}
                                    <Button onClick={this.props.addItem} size='small' kind='primary'>Add Entry</Button>
                                    <Button onClick={this.props.bulkAddItem} size='small' kind='primary'>Bulk Add</Button>
                                    <Button onClick={this.props.importItems} size='small' kind='primary'>Import CSV</Button>
                                </TableToolbarContent>
                            </TableToolbar>
                            <Table {...getTableProps()}>
                                <TableHead>
                                    <TableRow>
                                        {this.props.expandable && <TableExpandHeader />}
                                        <TableSelectAll {...getSelectionProps()} />
                                        {headers.map(header => (
                                            <TableHeader {...getHeaderProps({ header, })} sortDirection={this.state.sortDirection} isSortHeader={this.state.sortHeader == header.key} onClick={() => this.sortTable(header.key)}>
                                                {header.header}
                                            </TableHeader>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.props.expandable && rows.map(row => (
                                        <React.Fragment key={row.id} >
                                            <TableExpandRow {...getRowProps({ row, })}>
                                                <TableSelectRow {...getSelectionProps({ row })} />
                                                {row.cells.map(cell => (
                                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                                ))}
                                            </TableExpandRow>
                                            {
                                                row.isExpanded && (
                                                    <TableExpandedRow colSpan={headers.length + 2}>
                                                        {expandRow(this.props.data.find((element) => (element.key === row.id)))}
                                                    </TableExpandedRow>
                                                )
                                            }
                                        </React.Fragment>
                                    ))}
                                    {!this.props.expandable && rows.map(row => (
                                        <TableRow key={row.id}  {...getRowProps({ row, })}>
                                            <TableSelectRow {...getSelectionProps({ row, })} />
                                            {row.cells.map(cell => (
                                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                key={this.state.currentPage * this.props.data.length * this.state.updatePagination}
                                page={this.state.currentPage}
                                pageSize={this.state.currentPageSize}
                                pageSizes={[10, 30, 50, 100,]}
                                totalItems={this.props.data.length}
                                onChange={({ page, pageSize, }) => this.setState({ firstRowIndex: pageSize * (page - 1), currentPageSize: pageSize })}
                            />
                        </ TableContainer>
                    )}
            />
        );
    }
}

export default DataTableCarbon;