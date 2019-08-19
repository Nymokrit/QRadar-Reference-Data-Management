export const sets = {
    name: { value: '', type: 'text', label: 'Reference Set Name', help: 'Required: The name of the Set to be created. Must not exist already', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',], help: 'Required: The data type of the values in the new Set', },
    timeout_type: { value: 'UNKNOWN', type: 'select', label: 'Timeout Type', options: ['UNKNOWN', 'FIRST_SEEN', 'LAST_SEEN',], help: 'Optional: The value based on which new data expires from the Set', },
    time_to_live: { type: 'date', options: ['mons', 'days', 'hours', 'minutes', 'seconds',], value: '', label: 'Time to Live', help: 'Optional: If given, the entries of the set expire. Input format like \'1 days\', or \'12 hours\'', },
};

export const maps = {
    name: { value: '', type: 'text', label: 'Reference Map Name', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',], },
    timeout_type: { value: 'UNKNOWN', type: 'select', label: 'Timeout Type', options: ['UNKNOWN', 'FIRST_SEEN', 'LAST_SEEN',], },
    time_to_live: { type: 'date', options: ['mons', 'days', 'hours', 'minutes', 'seconds',], value: '', label: 'Time to Live', },
    key_label: { value: '', label: 'Key Label', },
    value_label: { value: '', label: 'Value Label', },
};

export const map_of_sets = {
    name: { value: '', type: 'text', label: 'Reference Map of Sets Name', },
    element_type: { value: 'ALN', type: 'select', label: 'Element Type', options: ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',], },
    timeout_type: { value: 'UNKNOWN', type: 'select', label: 'Timeout Type', options: ['UNKNOWN', 'FIRST_SEEN', 'LAST_SEEN',], },
    time_to_live: { type: 'date', options: ['mons', 'days', 'hours', 'minutes', 'seconds',], value: '', label: 'Time to Live', },
    key_label: { value: '', label: 'Key Label', },
    value_label: { value: '', label: 'Value Label', },
};

export const tables = {
    name: { value: '', type: 'text', label: 'Reference Table Name', help: 'Required: The name of the Table to be created. Must not exist already', },
    timeout_type: { value: 'UNKNOWN', type: 'select', label: 'Timeout Type', options: ['UNKNOWN', 'FIRST_SEEN', 'LAST_SEEN',], },
    time_to_live: { type: 'date', options: ['mons', 'days', 'hours', 'minutes', 'seconds',], value: '', label: 'Time to Live', },
    key_label: { value: 'Outer Key Label', label: 'Key Label', },
    element_type: { value: 'ALN', type: 'select', label: 'Key Type', options: ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',], },
    inner_labels: {
        label: 'Inner Keys',
        options: ['ALN', 'NUM', 'IP', 'PORT', 'ALNIC', 'DATE',],
        type: 'list',
        values: { 'Inner Key 1': { label: 'Inner Key 1', type: 'ALN', }, },
    },
};

export const setAddItem = {
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', },
};

export const setBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', },
};

export const setImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', },
};

export const mapAddItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', },
};

export const mapBulkAddItems = {
    'bulkAddData': { label: 'Entries', value: '', type: 'textarea', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: '=', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ',', help: 'New lines are implicit separators', },
};

export const mapImportItems = {
    'file': { label: 'File', value: '', type: 'file', },
    'bulkAddKeyValueSeparator': { label: 'Key-Value Separator', value: '=', },
    'bulkAddEntriesSeparator': { label: 'Entries Separator', value: ',', help: 'New lines are implicit separators', },
};

export const map_of_setsAddItem = {
    'keyAddDataKey': { label: 'Input Key', value: '', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', },
};

export const map_of_setsAddInnerItem = {
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', },
};

export const tableAddItem = {
    'keyAddDataKey': { label: 'Input Key', value: '', },
    'keyAddDataValues': { label: 'Input Values', value: '', type: 'textarea', },
    'keyAddSeparator': { label: 'Separator', value: ',', help: 'New lines are implicit separators', },
    'source': { value: '', label: 'Comment', },
};

export const tableAddInnerItem = {
    'key': { label: 'Key', value: '', type: 'text', },
    'value': { label: 'Value', value: '', type: 'text', },
    'source': { value: '', label: 'Comment', },
};