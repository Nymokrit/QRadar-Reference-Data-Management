import * as Formatters from '../Util/Formatters';

export const dataTableHeaders = [
    { key: 'type', header: 'Type', sort: true, },
    { key: 'name', header: 'Name', sort: true, },
    { key: 'number_of_elements', header: 'Number of Elements', sort: true, },
    { key: 'creation_time', header: 'Created at', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'element_type', header: 'Type', sort: true, },
    { key: 'timeout_type', header: 'Timeout', sort: true, },
];

export const setTableHeaders = [
    { key: 'value', header: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'first_seen', header: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'last_seen', header: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'source', header: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
];

export const mapTableHeaders = [
    { key: 'key', header: 'Key', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'value', header: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'first_seen', header: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'last_seen', header: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'source', header: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
];

export const mapOfSetsTableHeaders = [
    { key: 'key', header: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
];

export const mapOfSetsInnerTableHeaders = [
    { key: 'value', header: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'first_seen', header: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'last_seen', header: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'source', header: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
];

export const tableTableHeaders = [
    { key: 'key', header: 'Key', sort: true, style: { width: '10000px', wordBreak: 'break-all', }, },
];

export const tableInnerTableHeaders = [
    { key: 'key', header: 'Inner Key', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'value', header: 'Value', sort: true, style: { wordBreak: 'break-all', }, },
    { key: 'first_seen', header: 'First Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'last_seen', header: 'Last Seen', sort: true, formatter: Formatters.dateFormatter, },
    { key: 'source', header: 'Source', sort: true, style: { wordBreak: 'break-all', }, },
];