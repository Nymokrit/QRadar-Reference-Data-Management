import i18n from '../I18n/i18n';

const typeOptions = ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',];
const timeoutOptions = ['FIRST_SEEN', 'LAST_SEEN',];
const timeOptions = ['mons', 'days', 'hours', 'minutes', 'seconds',];

export const sets = {
    name: { value: '', type: 'text', label: i18n.t('data.new.name', { name: 'Set' }), help: i18n.t('data.new.name.help', { name: 'Set' }), },
    element_type: { value: 'ALN', type: 'select', label: i18n.t('data.new.elementtype'), options: typeOptions, help: 'Required: The data type of the values in the new Set', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: i18n.t('data.new.timeout'), options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Set', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: i18n.t('data.new.ttl'), help: 'Optional: If given, the entries of the set expire', },
};

export const maps = {
    name: { value: '', type: 'text', label: i18n.t('data.new.name', { name: 'Map' }), help: i18n.t('data.new.name.help', { name: 'Map' }), },
    element_type: { value: 'ALN', type: 'select', label: i18n.t('data.new.elementtype'), options: typeOptions, help: 'Required: The data type of the values in the new Map', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: i18n.t('data.new.timeout'), options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Map', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: i18n.t('data.new.ttl'), help: 'Optional: If given, the entries of the Map expire', },
    key_label: { value: '', label: i18n.t('data.new.key'), type: 'text', help: 'Required: The label of the keys in the new Map' },
    value_label: { value: '', label: i18n.t('data.new.value'), type: 'text', help: 'Required: The label of the values in the new Map' },
};

export const map_of_sets = {
    name: { value: '', type: 'text', label: i18n.t('data.new.name', { name: 'Map of Sets' }), help: i18n.t('data.new.name.help', { name: 'Map of Sets' }), },
    element_type: { value: 'ALN', type: 'select', label: i18n.t('data.new.elementtype'), options: typeOptions, help: 'Required: The data type of the values in the new Map of Sets', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: i18n.t('data.new.timeout'), options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Map of Sets', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: i18n.t('data.new.ttl'), help: 'Optional: If given, the entries of the Map of Sets expire', },
    key_label: { value: '', label: i18n.t('data.new.key'), type: 'text', help: 'Required: The label of the keys in the new Map of Sets' },
    value_label: { value: '', label: i18n.t('data.new.value'), type: 'text', help: 'Required: The label of the values in the new Map of Sets' },
};

export const tables = {
    name: { value: '', type: 'text', label: i18n.t('data.new.name', { name: 'Table' }), help: i18n.t('data.new.name.help', { name: 'Table' }), },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: i18n.t('data.new.timeout'), options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Table', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: i18n.t('data.new.ttl'), help: 'Optional: If given, the entries of the Table expire', },
    key_label: { value: i18n.t('data.new.key.outer'), label: i18n.t('data.new.key'), type: 'text', help: 'Required: The label of the keys in the new Table' },
    element_type: { value: 'ALN', type: 'select', label: i18n.t('data.new.key.type'), options: typeOptions, help: 'Required: The fallback data type of the Inner Keys in the new Table', },
    inner_labels: {
        label: 'Inner Keys',
        options: typeOptions,
        type: 'list',
        values: { 'Inner Key 1': { label: 'Inner Key 1', type: 'ALN', }, },
        help: 'Required: The data type of the Inner Keys in the new Table',
    },
};

export const setAddItem = {
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: i18n.t('data.table.elements.add.source'), type: 'text', help: i18n.t('data.table.elements.add.source.help') },
};

export const setBulkAddItems = {
    'bulkAddData': { label: i18n.t('data.table.elements.add.entries'), value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: i18n.t('data.table.elements.add.separator.help'), type: 'text', },
};

export const setImportItems = {
    'file': { label: i18n.t('data.table.elements.add.file'), value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: i18n.t('data.table.elements.file.separator.help'), type: 'text', },
    'containsHeaders': { label: 'CSV contains headers', value: true, help: 'Whether the CSV has a headers row or not', type: 'checkbox', },
};

export const mapAddItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: i18n.t('data.table.elements.add.source'), type: 'text', help: i18n.t('data.table.elements.add.source.help') },
};

export const mapBulkAddItems = {
    'bulkAddData': { label: i18n.t('data.table.elements.add.entries'), value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', type: 'text', help: 'Example Format: Key1,Value1\\nKey2,Value2\\nKey3,Value3, ...', },
};

export const mapImportItems = {
    'file': { label: i18n.t('data.table.elements.add.file'), value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', type: 'text', help: 'Example Format: Key1,Value1\\nKey2,Value2\\nKey3,Value3, ...' },
    'containsHeaders': { label: 'CSV contains headers', value: true, help: 'Whether the CSV has a headers row (key,value,first_seen...) or not', type: 'checkbox', },
};

export const map_of_setsAddItem = {
    'keyAddDataKey': { label: 'Input Key', value: '', type: 'text', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: i18n.t('data.table.elements.add.separator.help'), type: 'text', },
};

export const map_of_setsAddInnerItem = {
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: i18n.t('data.table.elements.add.source'), type: 'text', help: i18n.t('data.table.elements.add.source.help') },
};

export const map_of_setsImportItems = {
    'file': { label: i18n.t('data.table.elements.add.file'), value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Key1,Value1\\nKey1,Value2\\nKey2,Value3, ...', type: 'text', },
    'containsHeaders': { label: 'CSV contains headers', value: true, help: 'Whether the CSV has a headers row or not', type: 'checkbox', },
};

export const map_of_setsBulkAddItems = {
    'bulkAddData': { label: i18n.t('data.table.elements.add.entries'), value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Key1,Value1\\nKey1,Value2\\nKey2,Value3, ...', type: 'text', },
};

export const tableAddItem = { // Dynamically overwriten in ReferenceTable.js
    'keyAddDataKey': { label: 'Input Key', value: '', type: 'text', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: i18n.t('data.table.elements.add.separator.help'), type: 'text', },
};

export const tableAddInnerItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: i18n.t('data.table.elements.add.source'), type: 'text', help: i18n.t('data.table.elements.add.source.help') },
};

export const tableImportItems = {
    'file': { label: i18n.t('data.table.elements.add.file'), value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Parent Key, Inner Key, Value\\n...', type: 'text', },
    'containsHeaders': { label: 'CSV contains headers', value: true, help: 'Whether the CSV has a headers row or not', type: 'checkbox', },
    'experimentalFormat': {
        label: 'Use new experimental format for upload', value: true, type: 'checkbox', help: 'Structures the uploadable table in a more intuitive table format instead of the internal QRadar representation. Please download the existing table first to see the valid format and keep the new data in that format as well'
    },
};

export const tableBulkAddItems = {
    'bulkAddData': { label: i18n.t('data.table.elements.add.entries'), value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Parent Key, Inner Key, Value\\n...', type: 'text', },
};

export const tableExportItems = {
    'experimentalFormat': {
        label: 'Use new experimental format for download', value: true, type: 'checkbox', help: 'Structures the downloadable table in a more intuitive table format instead of the internal QRadar representation. It\'s more intuitive but contains fewer details (e.g. no source) and is error prone if the table is un- or semi-structured)'
    },
    /* 'FormatHelp': { value: '', type: 'helpText', }, */
};
