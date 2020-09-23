import React, { Component } from 'react';

import { Delete24 } from '@carbon/icons-react';
import { Button, DataTable, TableExpandHeader, TableExpandRow, TableExpandedRow, Pagination } from 'carbon-components-react';
import i18n from '../I18n/i18n';
import dateformat from 'dateformat';

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

const dateFormatter = (input) => dateformat(input, 'dd/mmm/yyyy, hh:MM:ss TT')
/*
const dateFormatter = (input) => {
    const date = new Date(input);
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // month is zero indexed
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()

    const formatted = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    return formatted;
}
*/

class DataTableCarbon extends Component {
    formatters = { 'first_seen': dateFormatter, 'last_seen': dateFormatter }

    constructor(props) {
        super(props);

        let pageSize = 10
        if (props.data.length > 1e4) pageSize = 100
        if (props.data.length > 1e5) pageSize = 1000
        this.state = {
            currentPageSize: pageSize, firstRowIndex: 0, currentPage: 1, updatePagination: Math.random(), sortDirection: 'ASC'
        };
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
            return (
                <div id='inner-table'>
                    <DataTableCarbon
                        innerTable={true}
                        data={row.values}
                        headers={this.props.extendableHeaders}
                        addItem={(e) => this.props.addInnerItem(row)}
                        deleteItem={(selectedRows) => this.props.deleteInnerItem(row.key, selectedRows)}
                        searchText={this.props.innerSearchText}
                    />
                </div>
            );
        };

        return (
            <DataTable
                role='table'
                useZebraStyles={true}
                isSortable
                rows={data}
                headers={this.props.headers}
                render={({
                    rows,
                    getRowProps,
                    headers,
                    getHeaderProps,
                    selectedRows,
                    getSelectionProps,
                    getTableProps,
                    getBatchActionProps
                }) => (
                        <TableContainer>
                            <TableToolbar>
                                <TableBatchActions {...getBatchActionProps()} shouldShowBatchActions={selectedRows.length} translateWithId={(id, state = {}) => i18n.t(id, { totalSelected: state.totalSelected })}>
                                    <TableBatchAction renderIcon={Delete24} onClick={(e) => this.props.deleteItem(selectedRows)}>{i18n.t('data.table.elements.delete')}</TableBatchAction>
                                </TableBatchActions>
                                <TableToolbarContent>
                                    {!this.props.innerTable && <TableToolbarSearch onChange={this.onInputChange} translateWithId={e => i18n.t(e)} />}{ /* We only display a search bar for the outer table since we don't expect many inner values anyways */}
                                    <Button onClick={this.props.addItem} size='small' kind='primary' className='btn-table'>{i18n.t('data.table.elements.add')}</Button>
                                    {!this.props.innerTable &&
                                        <React.Fragment>
                                            <Button onClick={this.props.bulkAddItem} size='small' kind='primary' className='btn-table'>{i18n.t('data.table.elements.bulk')}</Button>
                                            <Button onClick={this.props.importItems} size='small' kind='primary' className='btn-table'>{i18n.t('data.table.elements.import')}</Button>
                                            <Button onClick={this.props.exportItems} size='small' kind='primary' className='btn-table'>{i18n.t('data.table.elements.export')}</Button>
                                        </React.Fragment>
                                    }
                                </TableToolbarContent>
                            </TableToolbar>
                            <Table {...getTableProps()}>
                                <TableHead>
                                    <TableRow>
                                        { /* Providing props `ariaLabel`, `isExpanded` and `onExpand` only to make linting happy */}
                                        {this.props.expandable && <TableExpandHeader ariaLabel='Expand Row' isExpanded onExpand={(e) => (e)} />}
                                        <TableSelectAll {...getSelectionProps()} />
                                        {headers.map(header => (
                                            <TableHeader {...getHeaderProps({ header, })} sortDirection={this.state.sortDirection} isSortHeader={this.state.sortHeader === header.key} onClick={() => this.sortTable(header.key)}>
                                                {header.header}
                                            </TableHeader>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* For expandable Rows*/}
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
                                        <TableRow key={row.id} {...getRowProps({ row, })}>
                                            <TableSelectRow {...getSelectionProps({ row, })} />
                                            {row.cells.map(cell => {
                                                const key = cell.id.substring(cell.id.lastIndexOf(':') + 1);
                                                let value = cell.value;
                                                if (key in this.formatters) value = this.formatters[key](value);
                                                return <TableCell key={cell.id}>{value}</TableCell>
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                role='navigation'
                                key={this.state.currentPage * this.props.data.length * this.state.updatePagination}
                                page={this.state.currentPage}
                                pageSize={this.state.currentPageSize}
                                pageSizes={[10, 30, 50, 100, 1000]}
                                totalItems={this.props.data.length}
                                itemsPerPageText={i18n.t('carbon.table.pagination.items.per.page')}
                                pageRangeText={(current, total) => i18n.t('carbon.table.pagination.pages.total', { total })}
                                itemRangeText={(min, max, total) => i18n.t('carbon.table.pagination.items.total', { min, max, total })}
                                onChange={({ page, pageSize, }) => this.setState({ firstRowIndex: pageSize * (page - 1), currentPageSize: pageSize })}
                            />
                        </ TableContainer>
                    )}
            />
        );
    }
}

export default DataTableCarbon;