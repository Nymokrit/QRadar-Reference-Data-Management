import * as APIHelper from '../../Util/APIHelper';
import parseCSV from '../../Util/CSV';

import ReferenceData from './ReferenceData';

class ReferenceTable extends ReferenceData {
    constructor(props) {
        super(props, 'table');
    }

    clickAddItem = () => {
        const inners = {};
        if (this.state.metaData) {
            for (const key in this.state.metaData.key_name_types) {
                inners[key] = { label: key, value: '', type: 'text', element_type: this.state.metaData.key_name_types[key], };
            }
        }

        const entryDefinition = { 'outer_key': { label: this.state.metaData.key_label || 'Key', value: '', type: 'text', }, ...inners, source: { label: 'Comment', value: '', type: 'text', help: 'Optional: A comment to add to the new data entry' }, };

        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: entryDefinition });
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    addItem = async (entry) => {
        let response;
        let updateData = this.state.allEntries;
        const [outer_key, source] = [entry.outer_key.value, entry.source.value];
        if (!outer_key) return;

        this.props.displayLoadingModal(true);
        // Check if Key already exists in table
        const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
        if (keyIndex === -1) updateData.push({ key: outer_key, values: [], id: outer_key, });

        this.tableChanged('new', updateData);

        delete entry.outer_key;
        delete entry.source;
        for (const key in entry) {
            // Entries[key] not set === no value for this key needs to be saved
            if (!entry[key].value) continue;
            response = await this.addInnerItem({ key: outer_key, }, { key: { value: key, }, value: { value: entry[key].value, }, source: { value: source, }, }, true);
        }

        this.updateMetaData(response);
        this.props.displayLoadingModal(false);
    }

    // Entries should be an array containing the values to be deleted
    deleteItem = async (entries) => {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        /* Due to the API limitations, we cannot simply delete a key but we need to specify
         * the inner_key and the value we want to delete as well. Hence, we iterate through each inner_key
         * and delete the value. If all values have been deleted successfully, we can remove the outer key
         * Known issue: If a key is empty (which shouldn't happen but can), it cannot be deleted 
         * Workaround for the user: Add a value to that key and delete it afterwards
         */
        for (const entry of entries) {
            const outer_key = entry.id;
            const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
            for (const inner_entry of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key, inner_entry.key, { value: inner_entry.value, });

                if (response.error) this.props.showError(response.message);
                else updateData[keyIndex].values = updateData[keyIndex].values.filter(e => e.key !== inner_entry.key);
            }
            if (updateData[keyIndex].values.length === 0) updateData.splice(keyIndex, 1);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    addInnerItem = async (key, entries, asSub) => {
        const username = await this.defaultEntryComment();
        const [outer_key, inner_key, value, source] = [key.key, entries.key.value, entries.value.value, entries.source.value || username];
        let updateData = this.state.allEntries;

        if (!outer_key || !inner_key || !value) return;

        this.props.displayLoadingModal(true);
        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { outer_key, inner_key, value, source, });

        if (response.error) {
            this.props.showError(response.message);
        } else {
            const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
            const innerKeyIndex = updateData[keyIndex].values.findIndex((value) => (value.key === inner_key));

            const entry = { outer_key, key: inner_key, value, source, id: inner_key, first_seen: Date.now(), last_seen: Date.now() }
            // If the inner key is not yet defined for that specific outer key, we can simply add it
            if (innerKeyIndex === -1) updateData[keyIndex].values.push(entry);
            else updateData[innerKeyIndex].values[innerKeyIndex] = entry;

            this.updateMetaData(response);
            this.tableChanged('new', updateData);
        }

        // We utilize this method to add keys from the addItem method as well. If this is used
        // we need to pass the response through and keep the loading modal open
        if (asSub) return response;
        else this.props.displayLoadingModal(false);
    }

    deleteInnerItem = async (outer_key, entries) => {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const entry of entries) {
            const inner_key = entry.id;
            const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
            const innerKeyIndex = updateData[keyIndex].values.findIndex((value) => value.key === inner_key);
            response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key, inner_key, { value: updateData[keyIndex].values[innerKeyIndex].value, });
            if (response.error) this.props.showError(response.message);
            else updateData[keyIndex].values.splice(innerKeyIndex, 1);

            if (updateData[keyIndex].values.length === 0) updateData.splice(keyIndex, 1);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    importItems = async (entries) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const text = reader.result;
            let tuples = parseCSV(text, entries.bulkAddSeparator.value);
            // we can safely ignore headers if they are present
            // since we just care about the correct format of the values and interpret them statically as
            // outer_key, inner_key, value, ...rest
            if (entries.containsHeaders.value) tuples = tuples.slice(1);

            const data = {};
            for (const tuple of tuples) {
                // we only care about the first couple values, so the ...rest is ignored (i.e. source, first_seen..)
                const [key, innerKey, value, /* ...rest */] = tuple;
                if (!data.hasOwnProperty(key)) {
                    data[key] = {};
                }
                data[key][innerKey] = value;
            }
            this.bulkAdd(data);
        };

        if (entries.file && entries.file.value)
            reader.readAsText(entries.file.value);
    }

    exportItems = (selection) => {
        const entries = [];
        if (selection.experimentalFormat.value === true) {
            for (const entry of this.state.allEntries) {
                let temp = { key: entry.id };
                for (const value of entry.values) {
                    temp[value.key] = value.value;
                }
                entries.push(temp);
            }
            this.downloadTable(this.props.name, entries, Object.keys(this.state.metaData.key_name_types).sort());
        } else {
            // Get a flat map of key/value tuples that we can dump afterwards
            for (const entry of this.state.allEntries) {
                entries.push(...entry.values);
            }
            this.download(this.props.name, entries, true, true);
        }
    }

    bulkAddItems = async (entries) => {
        const tuples = entries.bulkAddData.value
            .split(/\r?\n/g)
            .map(value => value.trim())
            .filter(value => value);

        const data = {};

        for (const tuple of tuples) {
            const [key, innerKey, value,] = tuple.split(entries.bulkAddSeparator.value).map(value => value.trim()).filter(x => x);
            if (!data.hasOwnProperty(key)) {
                data[key] = {};
            }
            data[key][innerKey] = value;
        }
        this.bulkAdd(data);
    }

    /**
     * {"key1":{"col1":"Data11","col2":"Data12","col3":"Data13","col4":"Data14"},
     *  "key2":{"col1":"Data21","col2":"Data22","col3":"Data23","col4":"Data24"},
     *  }
     */
    bulkAdd = async (data) => {
        this.props.displayLoadingModal(true);

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.updateMetaData(response);
        }
        await this.loadData(this.props.type, true);
        this.props.displayLoadingModal(false);
    }


    parseResponseData = (response) => {
        let data = [];
        if (response.number_of_elements > 0) {
            // for each key, append key/id attributes to each value because we will need that in the table operations of the 'inner table'
            for (const key in response.data) {
                for (const inner_key in response.data[key]) {
                    response.data[key][inner_key] = {
                        outer_key: key,
                        key: inner_key,
                        id: inner_key,
                        ...response.data[key][inner_key],
                    };
                }
            }

            data = Object.keys(response.data).map(i => ({ key: i, values: Object.values(response.data[i]), id: i, }));
        }
        return data;
    }

    tableChangedXX = (type, options) => {
        const headers = [{ key: 'key', header: 'IoC' }];
        const knownHeaders = ['key'];
        if (this.state.metaData) {
            for (const key in this.state.metaData.key_name_types) {
                headers.push({ key: key, header: key });
                knownHeaders.push(key);
            }
        }

        let allEntries = this.state.allEntries;
        let searchText = this.state.searchText;
        if (type === 'search' && options) searchText = options.searchText;
        if (type === 'new' && options) allEntries = options;


        const tableData = [];
        let isRegexSearch = false;
        try { // Check if the current expression can be parsed as regex, if not, we try string matching
            searchText = new RegExp(searchText, 'gi');
            isRegexSearch = true;
        } catch (e) { }

        let i = 0;
        for (const entry of allEntries) {
            const matches = this.testValue(entry, searchText, isRegexSearch);
            if (matches) {
                //entry['index'] = i++; // required unique key for dataTable
                const tEntry = { key: entry.key, id: entry.key, index: i++ }
                for (const value of entry.values) {
                    tEntry[value.key] = value.value;
                    if (!knownHeaders.includes(value.key)) {
                        headers.push({ key: value.key, header: value.key });
                        knownHeaders.push(value.key);
                    }
                }
                tableData.push(tEntry);
            }
        }
        console.log(tableData, headers);
        this.setState({ tableData, searchText, allEntries, headers });
    }


    testValue = (entry, searchText, isRegexSearch) => {
        try {
            let matches = false;
            if (isRegexSearch) matches = entry.key.match(searchText);
            else matches = entry.key.toLowerCase().includes(searchText.toLowerCase());

            // if we found the string as part of a key, we add the entry
            if (matches) return true;
            // if we didn't find the string as key, let's try each value
            else {
                for (const value of entry.values) {
                    if (isRegexSearch) matches = value.value.match(searchText);
                    else matches = value.value.toLowerCase().includes(searchText.toLowerCase());

                    if (matches) return true;
                }
            }
        } catch (e) {
            return false;
        }
        return false;
    }
}



export default ReferenceTable;
