import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';


class ReferenceDataTable extends Component {
    constructor(props) {
        super(props);

        this.state = { selected: [], };

        this.clearSelection = this.clearSelection.bind(this);

        if (this.props.innerTable) this.props.selectionClearedCallback(this.props.parent.key, this.clearSelection);
        else this.props.selectionClearedCallback(this.clearSelection);
    }

    clearSelection() {
        console.log('Clear Selection');
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
                    <ReferenceDataTable
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


        const { SearchBar, } = Search;
        const contentTable = ({ paginationProps, paginationTableProps, }) => (
            <React.Fragment>
                <ToolkitProvider
                    keyField='id'
                    data={this.props.data}
                    columns={this.props.columns}
                    search
                >
                    {toolkitprops => (
                        <React.Fragment>
                            {this.props.addItem && <button className='btn-default btn-ref-data btn-add' onClick={this.props.addItem}>Add Entry</button>}
                            {this.props.bulkAddItem && <button className='btn-default btn-ref-data btn-bulk' onClick={this.props.bulkAddItem}>Bulk Add</button>}
                            {this.props.importItems && <button className='btn-default btn-ref-data btn-import' onClick={this.props.importItems}>Import CSV</button>}
                            {this.props.exportItems && <button className='btn-default btn-ref-data btn-export' onClick={this.props.exportItems}>Export CSV</button>}
                            {this.props.deleteItem && <button className='btn-default btn-ref-data btn-delete-data' onClick={this.props.deleteItem}>Delete Entry</button>}
                            {!this.props.innerTable && <SearchBar {...toolkitprops.searchProps} />}
                            <BootstrapTable
                                hover
                                keyField='id'
                                remote={{ search: true, }}
                                onTableChange={this.props.tableChanged}
                                expandRow={this.props.expandable && expandRow}
                                selectRow={{
                                    mode: 'checkbox',
                                    clickToSelect: true,
                                    clickToExpand: true,
                                    selected: this.state.selected,
                                    onSelect: this.handleOnSelect,
                                    onSelectAll: this.handleOnSelectAll,
                                    selectionHeaderRenderer: ({ indeterminate, ...rest }) => (
                                        <React.Fragment><input
                                            type='checkbox'
                                            onChange={e => e}
                                            ref={(input) => {
                                                if (input) input.indeterminate = indeterminate;
                                            }}
                                            {...rest}
                                        /><label /></React.Fragment>
                                    ),
                                    selectionRenderer: ({ mode, ...rest }) => {
                                        delete rest.rowIndex; // solely for the purpose of getting rid of ReactWarnings
                                        return <React.Fragment><input type={mode} {...rest} onChange={e => e} /><label /></React.Fragment>;
                                    },
                                }}
                                {...toolkitprops.baseProps}
                                {...paginationTableProps}
                            />
                        </React.Fragment>
                    )}
                </ToolkitProvider>
            </React.Fragment>
        );

        return (
            <PaginationProvider pagination={paginationFactory()}>
                {contentTable}
            </PaginationProvider>

        );
    }
}

export default ReferenceDataTable;