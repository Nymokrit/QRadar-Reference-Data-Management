const typeOptions = ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',];
const timeoutOptions = ['FIRST_SEEN', 'LAST_SEEN',];
const timeOptions = ['mons', 'days', 'hours', 'minutes', 'seconds',];

export const sets = {
    name: { value: '', type: 'text', label: 'Reference Set Name', help: 'Required: The name of the Set to be created. Must not exist already', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: typeOptions, help: 'Required: The data type of the values in the new Set', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: 'Timeout Type', options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Set', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: 'Time to Live', help: 'Optional: If given, the entries of the set expire', },
};

export const maps = {
    name: { value: '', type: 'text', label: 'Reference Map Name', help: 'Required: The name of the Map to be created. Must not exist already', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: typeOptions, help: 'Required: The data type of the values in the new Map', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: 'Timeout Type', options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Map', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: 'Time to Live', help: 'Optional: If given, the entries of the Map expire', },
    key_label: { value: '', label: 'Key Label', type: 'text', help: 'Required: The label of the keys in the new Map' },
    value_label: { value: '', label: 'Value Label', type: 'text', help: 'Required: The label of the values in the new Map' },
};

export const map_of_sets = {
    name: { value: '', type: 'text', label: 'Reference Map of Sets Name', help: 'Required: The name of the Map of Sets to be created. Must not exist already', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: typeOptions, help: 'Required: The data type of the values in the new Map of Sets', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: 'Timeout Type', options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Map of Sets', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: 'Time to Live', help: 'Optional: If given, the entries of the Map of Sets expire', },
    key_label: { value: '', label: 'Key Label', type: 'text', help: 'Required: The label of the keys in the new Map of Sets' },
    value_label: { value: '', label: 'Value Label', type: 'text', help: 'Required: The label of the values in the new Map of Sets' },
};

export const tables = {
    name: { value: '', type: 'text', label: 'Reference Table Name', help: 'Required: The name of the Table to be created. Must not exist already', },
    timeout_type: { value: 'FIRST_SEEN', type: 'select', label: 'Timeout Type', options: timeoutOptions, help: 'Optional: The value based on which new data expires from the Table', },
    time_to_live: { value: '', type: 'date', options: timeOptions, label: 'Time to Live', help: 'Optional: If given, the entries of the Table expire', },
    key_label: { value: 'Outer Key Label', label: 'Key Label', type: 'text', help: 'Required: The label of the keys in the new Table' },
    element_type: { value: 'ALN', type: 'select', label: 'Key Type', options: typeOptions, help: 'Required: The data type of the Outer Keys in the new Table', },
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
    'source': { value: '', label: 'Comment', type: 'text', help: 'Optional: A comment to add to the new data entry' },
};

export const setBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const setImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const mapAddItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', type: 'text', help: 'Optional: A comment to add to the new data entry' },
};

export const mapBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: '=', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const mapImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: '=', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const map_of_setsAddItem = {
    'keyAddDataKey': { label: 'Input Key', value: '', type: 'text', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const map_of_setsAddInnerItem = {
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', type: 'text', help: 'Optional: A comment to add to the new data entry' },
};

export const map_of_setsImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddKeyValueSeparator': { label: 'Key-Values Separator', value: '=', help: 'Example Format: Key=Value1,Value2;Key2=Value3, ...', type: 'text', },
    'bulkAddValuesSeparator': { label: 'Value-Value Separator', value: ',', help: 'Example Format: Key=Value1,Value2;Key2=Value3, ...', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ';', help: 'New lines are implicit separators', type: 'text', },
};

export const map_of_setsBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddKeyValueSeparator': { label: 'Key-Values Separator', value: '=', help: 'Example Format: Key=Value1,Value2;Key2=Value3, ...', type: 'text', },
    'bulkAddValuesSeparator': { label: 'Value-Value Separator', value: ',', help: 'Example Format: Key=Value1,Value2;Key2=Value3, ...', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ';', help: 'New lines are implicit separators', type: 'text', },
};

export const tableAddItem = { // Dynamically overwriten in ReferenceTable.js
    'keyAddDataKey': { label: 'Input Key', value: '', type: 'text', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', type: 'text', },
};

export const tableAddInnerItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', type: 'text', help: 'Optional: A comment to add to the new data entry' },
};

export const tableImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Parent Key, Inner Key, Value; ...', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ';', help: 'New lines are implicit separators', type: 'text', },
};

export const tableBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: ',', help: 'Example Format: Parent Key, Inner Key, Value; ...', type: 'text', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ';', help: 'New lines are implicit separators', type: 'text', },
};
