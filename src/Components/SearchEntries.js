import React, { useState } from 'react';
import { TextInput, Form, FormGroup, Button, DataTable, Link } from 'carbon-components-react';
import i18n from '../I18n/i18n';
import * as APIHelper from '../Util/APIHelper';
const {
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
} = DataTable;

function SearchEntries(props) {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState([]);
    const [hasResults, setHasResults] = useState(undefined);

    const searchInputChanged = (event) => { setSearchText(event.target.value); };
    const search = async () => {
        props.displayLoadingModal(true);
        let response = await APIHelper.searchAllData(props.type, searchText);
        if (response.error) {
            props.showError(response.message);
        } else {
            response = response.map(e => ({ id: e.name, ...e }));
            if (response.length) {
                setResults(response);
            } else {
                setResults([{ name: i18n.t('data.search.all.no.results') }]);
            }
            setHasResults(response.length ? true : false);
        }
        props.displayLoadingModal(false)
    }

    return (
        <div id='searchAll'>
            <Form>
                <FormGroup legendText='search sets'>
                    <TextInput type='text' value={searchText} onChange={searchInputChanged} labelText={i18n.t('data.search.all.input')} placeholder={i18n.t('data.search.all.placeholder')} />
                    <Button kind='primary' size='small' className='btn-search-all' onClick={search}>{i18n.t('data.search.all.button')}</Button>
                </FormGroup>
            </Form>
            <DataTable
                headers={[{ header: i18n.t('data.search.all.table.title'), key: 'name', },]}
                rows={results}
                useZebraStyles={true}
                render={({ rows, headers, getTableProps, getHeaderProps, getRowProps, }) => (
                    <Table {...getTableProps()}>
                        <TableHead>
                            <TableRow>
                                {headers.map(header => (<TableHeader {...getHeaderProps({ header, })}>{header.header}</TableHeader>))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => (
                                <TableRow key={row.id} {...getRowProps({ row, })}>
                                    {row.cells.map(cell => (
                                        <TableCell key={cell.id}>
                                            {
                                                hasResults === false ?
                                                    <label>{cell.value}</label>
                                                    :
                                                    <Link href='#' onClick={e => { e.preventDefault(); props.open(undefined, { key: `${props.type}/${cell.value}` }) }}>{cell.value}</Link>
                                            }
                                        </TableCell>))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            />
        </div>
    );

}

export default SearchEntries;