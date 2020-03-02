import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Download16, Delete24 } from '@carbon/icons-react';
import { Button, DataTable } from 'carbon-components-react';
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableToolbar,
    TableToolbarAction,
    TableSelectAll,
    TableSelectRow,
    TableBatchActions,
    TableBatchAction,
    TableToolbarContent,
    TableToolbarSearch
} = DataTable;

class DataTableCarbon extends Component {
    constructor(props) {
        super(props);

        this.state = { selected: [], };

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

    render() {
        const expandRow = {
            showExpandColumn: true,
            expandByColumnOnly: false,
            expandHeaderColumnRenderer: ({ isAnyExpands, }) => (<FontAwesomeIcon icon={isAnyExpands ? 'minus' : 'plus'} />),
            expandColumnRenderer: ({ expanded, }) => (<FontAwesomeIcon icon={expanded ? 'minus' : 'plus'} />),
            renderer: row => (
                <div className='inner-table'>
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
                </div>
            ),
        };

        return (
            <DataTable
                useZebraStyles
                isSortable
                rows={this.props.data}
                headers={this.props.columns}
                render={({ rows, headers, getHeaderProps, onInputChange, getBatchActionProps, selectedRows, getSelectionProps }) => (
                    <TableContainer>
                        <TableToolbar>
                            <TableBatchActions {...getBatchActionProps()}>
                                {/* inside of you batch actinos, you can include selectedRows */}
                                <TableBatchAction renderIcon={Delete24} onClick={this.props.deleteItem}>
                                    Delete
                                    </TableBatchAction>
                            </TableBatchActions>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={onInputChange} />
                                <Button onClick={this.props.addItem} small kind="primary">
                                    Add Entry
                                    </Button>
                                <Button onClick={this.props.bulkAddItem} small kind="primary">
                                    Bulk Add
                                    </Button>
                                <Button onClick={this.props.importItems} small kind="primary">
                                    Import CSV
                                    </Button>
                            </TableToolbarContent>
                        </TableToolbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map(header => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow {...getSelectionProps({ row })} />
                                        {row.cells.map(cell => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            />
        )
    }
}

export default DataTableCarbon;