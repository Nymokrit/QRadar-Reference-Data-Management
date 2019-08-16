import * as Formatters from '../Util/Formatters';

export const referenceSetTableColumns = [
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const referenceMapTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const referenceMapOfSetsTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const referenceMapOfSetsInnerTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, hidden: true, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const referenceTableTableColumns = [
    { dataField: 'key', text: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];

export const referenceTableInnerTableColumns = [
    { dataField: 'parentKey', text: 'Key', sort: true, hidden: true, },
    { dataField: 'key', text: 'Inner Key', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'value', text: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'first_seen', text: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'last_seen', text: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { dataField: 'source', text: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
    { dataField: 'id', text: 'ID', sort: true, hidden: true, },
];