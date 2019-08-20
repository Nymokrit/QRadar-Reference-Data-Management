import * as Formatters from '../Util/Formatters';

export const dataTableColumns = [
    { dataField: 'type', text: 'Type', sort: true, },
    { dataField: 'name', text: 'Name', sort: true, },
    { dataField: 'number_of_elements', text: 'Number of Elements', sort: true, },
    { dataField: 'creation_time', text: 'Created at', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'element_type', text: 'Type', sort: true, },
    { dataField: 'timeout_type', text: 'Timeout', sort: true, },
];

export const setTableColumns = [
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const mapTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const mapOfSetsTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const mapOfSetsInnerTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, hidden: true, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const tableTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const tableInnerTableColumns = [
    { dataField: 'parentKey', text: 'Key', sort: true, hidden: true, },
    { dataField: 'key', text: 'Inner Key', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];