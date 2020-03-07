import * as APIHelper from '../../Util/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import ReferenceData from './ReferenceData';

class ReferenceMapOfSets extends ReferenceData {
    constructor(props) {
        super(props, 'map_of_sets');
    }


    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        const values = entry.keyAddDataValues.value
            .replace(/\r?\n/g, entry.keyAddSeparator.value) // Remove new lines 
            .split(entry.keyAddSeparator.value)// split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values

        const key = entry.keyAddDataKey.value;
        const data = { [key]: values, };

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);
        if (response) {
            const updateData = this.updateData(this.state.allEntries, { key: key, values: values, source: 'reference data api', }, true, true);
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }

    }
    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.tableData;

        for (const key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            for (const value of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: value.value, });

                // IS this working? That should not work
                updateData = this.updateData(updateData, { key: key, }, false, true);

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

    async addInnerItem(key, entry) {
        const username = await RefDataHelper.defaultEntryComment();
        const parsedEntry = { value: entry['value'].value, key: key.key, source: entry['source'].value || username, };

        const indexOfKey = this.state.allEntries.findIndex((value) => (value.key === key.key));
        if (this.state.allEntries[indexOfKey].values.findIndex((value) => (value.value === entry['value'].value)) !== -1) {
            console.log('Value already in table. Skipping');
            this.props.showError('Value already in table.');
            return;
        }

        this.props.displayLoadingModal(true);
        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, parsedEntry);
        const updateData = this.updateData(this.state.allEntries, parsedEntry, true);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    async deleteInnerItem(key, entries) {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const entry of entries) {
            const value = entry.id;
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: value, });
            updateData = this.updateData(updateData, { key: key, value: value, }, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }


    updateData(updateData, entries, isAdd, isOuterKey) {
        if (isOuterKey) {
            if (isAdd) {
                // We expect an object {key: key, values: [values]}

                // Check if Key already exists in table
                const indexOfKey = updateData.findIndex((value) => (value.key === entries.key));
                if (indexOfKey === -1) {
                    // if no, we can add all values but we remove duplicates first
                    let values = [...new Set(entries.values),];
                    values = values.map((value) => ({ value: value, id: value, key: entries.key, source: entries.source, }));
                    updateData.push({ key: entries.key, values: values, id: entries.key, });
                } else {
                    // if yes, we need to check each inner value if it already exists
                    for (const value of entries.values) {
                        const indexOfValue = updateData[indexOfKey].values.findIndex((inner) => (inner.value === value));
                        // if no, we can add it to the table
                        if (indexOfValue === -1) updateData[indexOfKey].values.push({ value: value, id: value, key: entries.key, source: entries.source, });
                        // if yes, we skip it
                    }
                }
            }
            // We expect an object {key: key}
            else updateData = updateData.filter(e => e.key !== entries.key);
        } else {
            // We expect an object {key: key} or {key: key, value: value}
            const indexOfKey = updateData.findIndex((value) => (value.key === entries.key));
            if (indexOfKey === -1) {
                // if all goes as expected, that should never happen
                console.log('Something went wrong, couldn\'t find index of outer key in table when trying to delete inner key');
            } else {
                if (isAdd) {
                    updateData[indexOfKey].values.push({ value: entries.value, id: entries.value, key: entries.key, source: entries.source, });
                }
                else updateData[indexOfKey].values = updateData[indexOfKey].values.filter(e => e.value !== entries.value);
            }
        }

        return updateData;
    }


    parseResponseData(response) {
        let data = [];
        if (response.number_of_elements > 0) {
            // for each key, append key/id attributes to each value because we will need that in the table operations of the 'inner table'
            for (const key in response.data) {
                response.data[key] = response.data[key].map(elem => ({
                    key: key,
                    id: elem.value,
                    ...elem,
                }));
            }

            data = Object.keys(response.data).map(i => ({ key: i, values: response.data[i], valueLabel: response.value_label, id: i, }));
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
                bulkAddValuesSeparator: entries.bulkAddValuesSeparator,
                bulkAddData: { value: text, },
            };
            this.bulkAddItems(data);
        };

        reader.readAsText(entries.file.value);
    }


    async bulkAddItems(entries) {
        this.props.displayLoadingModal(true);

        const tuples = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddEntriesSeparator.value) // Remove new lines 
            .split(entries.bulkAddEntriesSeparator.value)
            .map(value => value.trim())
            .filter(value => value);


        const newData = {};


        for (const tuple of tuples) {
            const [key, values,] = tuple.split(entries.bulkAddKeyValueSeparator.value).map(value => value.trim()).filter(x => x);
            if (!newData.hasOwnProperty(key)) {
                newData[key] = {};
            }
            newData[key] = values.split(entries.bulkAddValuesSeparator.value).map(value => value.trim()).filter(x => x);;
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
        RefDataHelper.download(this.props.name, entries, true, false);
    }

    testValue(entry, searchText, isRegexSearch) {
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
        return false;
    }
}



export default ReferenceMapOfSets;
