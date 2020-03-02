import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import { Button } from 'carbon-components-react';

class DataTableX extends Component {
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
                    <DataTableX
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

        // const hidden = ['map_of_sets'].includes(this.props.type);
        const { SearchBar, } = Search;
        const contentTable = ({ paginationProps, paginationTableProps, }) => (
            <React.Fragment>
                <Button kind='tertiary' size='small' className='btn-default btn-ref-data' onClick={this.props.addItem}>Add Entry</Button>
                <Button kind='tertiary' size='small' className='btn-default btn-ref-data' onClick={this.props.bulkAddItem}>Bulk Add</Button>
                <Button kind='tertiary' size='small' className='btn-default btn-ref-data' onClick={this.props.importItems}>Import CSV</Button>
                <Button kind='tertiary' size='small' className='btn-default btn-ref-data' onClick={this.props.exportItems}>Export CSV</Button>
                <Button kind='danger' size='small' className='btn-default btn-ref-data' onClick={this.props.deleteItem}>Delete Entry</Button>
                <ToolkitProvider
                    keyField='id'
                    data={this.props.data}
                    columns={this.props.columns}
                    search
                >
                    {toolkitprops => (
                        <React.Fragment>
                            {!this.props.innerTable && <SearchBar {...toolkitprops.searchProps} />}
                            <BootstrapTable
                                hover
                                keyField='id'
                                remote={{ search: true, }}
                                onTableChange={this.props.tableChanged}
                                expandRow={this.props.expandable ? expandRow : undefined}
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

export default DataTableX;