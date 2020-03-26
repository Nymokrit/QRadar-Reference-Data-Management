import * as APIHelper from '../../Util/APIHelper';

import ReferenceData from './ReferenceData';

class ReferenceMapOfSets extends ReferenceData {
    constructor(props) {
        super(props, 'map_of_sets');

    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    addItem = async (entry) => {
        let values = entry.keyAddDataValues.value
            .replace(/\r?\n/g, entry.keyAddSeparator.value) // Remove new lines 
            .split(entry.keyAddSeparator.value)// split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values

        values = [...new Set(values),];

        const key = entry.keyAddDataKey.value;
        const data = { [key]: values, };

        this.props.displayLoadingModal(true);
        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);
        if (response.error) {
            this.props.showError(response.message);
        } else {
            let updateData = this.state.allEntries;

            const indexOfKey = updateData.findIndex((value) => (value.key === key));
            // Check if Key already exists in table
            if (indexOfKey === -1) {
                values = values.map((value) => ({ key, value, id: value, source: 'reference data api', }));
                updateData.push({ key, values, id: key, });
            } else {
                // if yes, we need to check each inner value if it already exists
                for (const value of values) {
                    const indexOfValue = updateData[indexOfKey].values.findIndex((inner) => (inner.value === value));
                    if (indexOfValue === -1) updateData[indexOfKey].values.push({
                        key, value, id: value, source: 'reference data api'
                    });
                }
            }

            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }
    // Entries should be an array containing the values to be deleted
    deleteItem = async (entries) => {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const entry of entries) {
            const key = entry.id;
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            for (const value of updateData[keyIndex].values) {
                response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: value.value, });
                if (response.error) this.props.showError(response.message)
            }
            updateData.splice(keyIndex, 1);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    addInnerItem = async (outer_key, entry) => {
        const username = await this.defaultEntryComment();
        const [value, key, source] = [entry['value'].value, outer_key.key, entry['source'].value || username,];

        const keyIndex = this.state.allEntries.findIndex((value) => (value.key === key));
        if (this.state.allEntries[keyIndex].values.findIndex((value) => (value.value === value)) !== -1) {
            this.props.showError('Value already in table.');
            return;
        }

        this.props.displayLoadingModal(true);
        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { value, key, source });

        if (response.error) {
            this.props.showError(response.message);
        } else {
            const updateData = this.state.allEntries;
            updateData[keyIndex].values.push({ value, key, source, id: value, first_seen: Date.now(), last_seen: Date.now() });
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    deleteInnerItem = async (key, entries) => {
        if (!entries || !entries.length) return;
        this.props.displayLoadingModal(true);
        let response;
        let updateData = this.state.allEntries;

        for (const entry of entries) {
            const value = entry.id;
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: value, });
            if (response.error) this.props.showError(response.message)
            else updateData[keyIndex].values = updateData[keyIndex].values.filter(e => e.value !== value);

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
            const pairs = text
                .split(/\r?\n/g)
                .map(value => value.trim())
                .filter(value => value);

            const data = {};
            for (const pair of pairs) {
                const [key, value,] = pair.split(entries.bulkAddSeparator.value).map(value => value.trim()).filter(x => x);
                if (!data.hasOwnProperty(key)) {
                    data[key] = [];
                }
                data[key].push(value.trim());
            }

            this.bulkAdd(data);
        };

        reader.readAsText(entries.file.value);
    }

    exportItems = () => {
        const entries = [];
        // Get a flat map of key/value pairs that we can dump afterwards
        for (const entry of this.state.allEntries) {
            entries.push(...entry.values);
        }
        this.download(this.props.name, entries, true, false);
    }

    bulkAddItems = async (entries) => {
        const pairs = entries.bulkAddData.value
            .split(/\r?\n/g)
            .map(value => value.trim())
            .filter(value => value);

        const data = {};
        for (const pair of pairs) {
            const [key, value,] = pair.split(entries.bulkAddSeparator.value).map(value => value.trim()).filter(x => x);
            if (!data.hasOwnProperty(key)) {
                data[key] = [];
            }
            data[key].push(value);
        }

        this.bulkAdd(data);
    }

    /**
     * Expected Format:
     * {"key1":["Data11","Data12"],
     *  "key2":["Data21","Data22"],
     *  "key3":["Data31","Data32"]}
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



export default ReferenceMapOfSets;
