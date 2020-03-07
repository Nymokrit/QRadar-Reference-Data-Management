import * as APIHelper from '../../Util/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import ReferenceData from './ReferenceData';

class ReferenceTable extends ReferenceData {
    constructor(props) {
        super(props, 'table');
    }

    clickAddItem() {
        const inners = {};
        if (this.state.metaData) {
            for (const key in this.state.metaData.key_name_types) {
                inners[key] = { label: key, value: '', type: 'text', element_type: this.state.metaData.key_name_types[key], };
            }
        }

        const entryDefinition = { 'outer_key': { label: this.state.metaData.key_label || 'Key', value: '', type: 'text', }, ...inners, source: { label: 'Comment', value: '', type: 'text', }, };

        this.setState({ showInputModal: true, modalSave: this.addItem, modalInputDefinition: entryDefinition, });
    }



    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;
        const outer_key = entry.outer_key.value;
        const source = entry.source.value;

        updateData = this.updateData(updateData, { outer_key: outer_key, values: [], }, true, true);
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
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const outer_key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === outer_key));
            for (const inner_map of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key, inner_map.key, { value: inner_map.value, });

                if (response.error) this.props.showError(response.message);
                else updateData = this.updateData(updateData, { outer_key: outer_key, }, false, true);
            }
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    async addInnerItem(key, entries, asSub) {
        if (!asSub) this.props.displayLoadingModal(true);
        const outer_key = key.key;
        const inner_key = entries.key.value;
        const value = entries.value.value;
        const username = await RefDataHelper.defaultEntryComment();
        const source = entries.source.value || username;

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { outer_key: outer_key, inner_key: inner_key, value: value, source: source, });

        const updateData = this.updateData(this.state.allEntries, { outer_key: outer_key, inner_key: inner_key, value: value, source: source, }, true);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.updateMetaData(response);
            this.tableChanged('new', updateData);
        }

        if (asSub) return response;
        this.props.displayLoadingModal(false);
    }

    async deleteInnerItem(outer_key, entries) {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const entry of entries) {
            const inner_key = entry.id;
            const indexOfOuterKey = updateData.findIndex((value) => (value.key === outer_key));
            const indexOfInnerKey = updateData[indexOfOuterKey].values.findIndex((value) => value.key === inner_key);
            response = await APIHelper.deleteReferenceDataInnerEntry(this.props.type, this.props.name, outer_key, inner_key, { value: updateData[indexOfOuterKey].values[indexOfInnerKey].value, });

            updateData = this.updateData(updateData, { outer_key: outer_key, inner_key: inner_key, }, false, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    /**
     * 
     * @param {Object} updateData The object into which new data should be appended
     * @param {Object} entries The new data to append, usually {outer_key, inner_key, value} or {outer_key, values} with values=[{inner_key, value}]
     * @param {bool} isAdd If the entry should be added or removed
     * @param {bool} isOuterKey If the entry comes from addItem (true) or addInnerItem (false)
     */
    updateData(updateData, entries, isAdd, isOuterKey) {
        if (isOuterKey) {
            if (isAdd) {
                // Check if Key already exists in table
                const indexOfOuterKey = updateData.findIndex((value) => (value.key === entries.outer_key));
                if (indexOfOuterKey === -1) {
                    updateData.push({ key: entries.outer_key, values: entries.values, id: entries.outer_key, });
                } else {
                    // If it already exists we skip it
                    // This method is only used to add outer keys, inner keys are added individually
                    return;
                }
            }
            else updateData = updateData.filter(e => e.key !== entries.outer_key);

        } else {
            const indexOfOuterKey = updateData.findIndex((value) => (value.key === entries.outer_key));
            if (indexOfOuterKey === -1) {
                console.log('Something went wrong, couldn\'t find index of outer key in table when trying to delete inner key');
            } else {
                const indexOfInnerKey = updateData[indexOfOuterKey].values.findIndex((value) => (value.key === entries.inner_key));
                if (isAdd) {
                    // If the inner key is not yet defined for that specific outer key, we can simply add it
                    if (indexOfInnerKey === -1)
                        updateData[indexOfOuterKey].values.push({ outer_key: entries.outer_key, key: entries.inner_key, value: entries.value, id: entries.inner_key, source: entries.source, });
                    else
                        updateData[indexOfInnerKey].values[indexOfInnerKey] = { outer_key: entries.outer_key, key: entries.inner_key, value: entries.value, id: entries.inner_key, source: entries.source, };
                }
                else updateData[indexOfOuterKey].values.splice(indexOfInnerKey, 1);
            }
        }

        return updateData;
    }

    parseResponseData(response) {
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

    async importItems(entries) {
        const reader = new FileReader();

        reader.onloadend = () => {
            const text = reader.result;
            const data = {
                bulkAddEntriesSeparator: entries.bulkAddEntriesSeparator,
                bulkAddKeyValueSeparator: entries.bulkAddKeyValueSeparator,
                bulkAddData: { value: text, },
            };
            this.bulkAddItems(data);
        };

        reader.readAsText(entries.file.value);
    }

    async bulkAddItems(entries) {
        // const regexEntries = new RegExp(entries.bulkAddEntriesSeparator.value, 'g');
        // const regexKeyValue = new RegExp(entries.bulkAddKeyValueSeparator.value, 'g');
        this.props.displayLoadingModal(true);

        const tuples = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddEntriesSeparator.value) // Remove new lines 
            .split(entries.bulkAddEntriesSeparator.value)
            .map(value => value.trim())
            .filter(value => value);


        const newData = {};


        for (const tuple of tuples) {
            const [key, innerKey, value,] = tuple.split(entries.bulkAddKeyValueSeparator.value).map(value => value.trim()).filter(x => x);
            if (!newData.hasOwnProperty(key)) {
                newData[key] = {};
            }
            newData[key][innerKey] = value;
            // newData.push({ key: key, value: value, id: key, source: 'reference data api', });
        }


        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, newData);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            // this.tableChanged('new', oldData);
            this.updateMetaData(response);
        }
        this.loadData(this.props.type, true);
        this.props.displayLoadingModal(false);
    }

    exportItems() {
        const entries = [];
        // Get a flat map of key/value pairs that we can dump afterwards
        for (const entry of this.state.allEntries) {
            entries.push(...entry.values);
        }
        RefDataHelper.download(this.props.name, entries, true, true);
    }

    testValue(entry, searchText, isRegexSearch) {
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
