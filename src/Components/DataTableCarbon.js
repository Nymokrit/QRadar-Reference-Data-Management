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

        this.state = { selected: [], currentPageSize: 10, firstRowIndex: 0, currentPage: 1, updatePagination: Math.random() };

        this.clearSelection = this.clearSelection.bind(this);

        if (this.props.innerTable) this.props.selectionClearedCallback(this.props.parent.key, this.clearSelection);
        else this.props.selectionClearedCallback(this.clearSelection);
    }

    clearSelection() {
        this.setState({ selected: [], });
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

    render() {
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
                    selectionChanged={this.props.innerSelectionChanged}
                    selectionClearedCallback={this.props.innerSelectionClearedCallback}
                />
            </div>);
        };

        console.log(this.props.data);
        return (
            <DataTable
                useZebraStyles={true}
                isSortable
                rows={this.props.data.slice(
                    this.state.firstRowIndex,
                    this.state.firstRowIndex + this.state.currentPageSize
                )}
                headers={this.props.columns}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getRowProps,
                    getSelectionProps,
                    getBatchActionProps,
                    selectedRows,
                }) => (
                        <TableContainer>
                            <TableToolbar>
                                <TableBatchActions {...getBatchActionProps()}>
                                    <TableBatchAction primaryFocus renderIcon={Delete24} onClick={(e) => this.props.deleteItem(selectedRows)}>
                                        Delete
                                </TableBatchAction>
                                </TableBatchActions>
                                <TableToolbarContent>
                                    {!this.props.innerTable && <TableToolbarSearch onChange={this.onInputChange} />}
                                    <Button onClick={this.props.addItem} size='small' kind='primary'>
                                        Add Entry
                                    </Button>
                                    <Button onClick={this.props.bulkAddItem} size='small' kind='primary'>
                                        Bulk Add
                                    </Button>
                                    <Button onClick={this.props.importItems} size='small' kind='primary'>
                                        Import CSV
                                    </Button>
                                </TableToolbarContent>
                            </TableToolbar>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {this.props.expandable && <TableExpandHeader />}
                                        <TableSelectAll {...getSelectionProps()} />
                                        {headers.map(header => (
                                            <TableHeader {...getHeaderProps({ header, })}>
                                                {header.header}
                                            </TableHeader>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.props.expandable && rows.map(row => (
                                        < React.Fragment key={row.id} >
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
                                        <TableRow key={row.id}>
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
                                pageSizes={[
                                    10,
                                    20,
                                    30,
                                    40,
                                    50,
                                ]}
                                totalItems={this.props.data.length}
                                onChange={({ page, pageSize, }) => {
                                    console.log(page);
                                    if (pageSize !== this.state.currentPageSize) {
                                        this.setState({ currentPageSize: pageSize, });
                                    }
                                    this.setState({ firstRowIndex: pageSize * (page - 1), });
                                }}
                            />
                        </ TableContainer>
                    )}
            />
        );
    }
}

export default DataTableCarbon;