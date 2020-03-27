
import * as APIHelper from '../../Util/APIHelper';
import parseCSV from '../../Util/CSV';


import ReferenceData from './ReferenceData';

class ReferenceMap extends ReferenceData {
    constructor(props) {
        super(props, 'map');
    }

    // Entry should consist of an JS Object of the form {key: 'someKey', value: 'someVal'}
    addItem = async (entry) => {
        if (!entry['value'].value || !entry['key'].value) return;

        this.props.displayLoadingModal(true);
        const username = await this.defaultEntryComment();
        const [key, value, source] = [entry['key'].value, entry['value'].value, entry['source'].value || username];

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { key, value, source });

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let updateData = this.state.allEntries;
            updateData.push({ key, value, source, id: key, first_seen: Date.now(), last_seen: Date.now(), });
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
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: updateData[keyIndex].value, });
            if (response.error) this.props.showError(response.message);
            else updateData.splice(keyIndex, 1);
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

            if (entries.containsHeaders.value) tuples = tuples.slice(1);

            const data = {};
            for (const tuple of tuples) {
                const [key, value,] = tuple;
                data[key] = value;
            }

            this.bulkAdd(data);
        };

        if (entries.file && entries.file.value)
            reader.readAsText(entries.file.value);
    }
    /**
     * Split all items and remove empty ones + leading/trailing whitespace. The perform bulk add
     * This is extracted into a second method bulkAdd to reuse the function for the import
     */
    bulkAddItems = async (entries) => {
        const tuples = entries.bulkAddData.value
            .split(/\r?\n/g) // each line is interpreted as one key=value tuple
            .map(value => value.trim())
            .filter(value => value);

        const data = {};
        for (const tuple of tuples) {
            const [key, value,] = tuple.split(entries.bulkAddSeparator.value).map(value => value.trim()).filter(x => x);
            data[key] = value;
        }

        this.bulkAdd(data);
    }

    /**
     * Data is expected to be a regular json object. The data is first uploaded to QRadar and upon success the table is updated locally.
     * This might potentially lead to inconsistencies as we mirror the 'expected' state which does not necessarily match the 'real' state. 
     * A potential workaround would be to directly reload the full map, however, this might be resource intensive so we accept potential temporary inconsistencies
     * as they can be resolved by clicking the reload button if necessary.
     * {"key1":"Data1",
     *  "key2":"Data2",
     *  "key3":"Data3",}
     */
    bulkAdd = async (data) => {
        this.props.displayLoadingModal(true);

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let tableData = this.state.allEntries;

            for (const key in data) {
                tableData.push({ key, value: data[key], id: key, source: 'reference data api', first_seen: Date.now(), last_seen: Date.now(), });
            }
            // remove new duplicate keys and keep the newest ones
            tableData = this.removeDuplicates(tableData)

            this.tableChanged('new', tableData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    exportItems = () => this.download(this.props.name, this.state.allEntries, true);

    removeDuplicates = (data) => {
        return data.reverse()
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.key === entry.key
                ))
            )
            .reverse();
    }

    parseResponseData = (response) => {
        const data = [];
        if (response.number_of_elements > 0) {
            for (const key in response.data) {
                if (key !== undefined) {
                    data.push({ key: key, ...response.data[key], id: key, });
                }
            }
            return data;
        }
    }

    testValue = (entry, searchText, isRegexSearch) => {
        if (!entry.value || !entry.key) return false;

        let matches = false;
        if (isRegexSearch) matches = entry.value.match(searchText) || entry.key.match(searchText);
        else matches = entry.value.toLowerCase().includes(searchText.toLowerCase()) || entry.key.toLowerCase().includes(searchText.toLowerCase());

        return matches;
    }
}



export default ReferenceMap;
