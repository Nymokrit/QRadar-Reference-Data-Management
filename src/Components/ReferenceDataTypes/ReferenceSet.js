import * as APIHelper from '../../Util/APIHelper';
import parseCSV from '../../Util/CSV';

import ReferenceData from './ReferenceData';

class ReferenceSet extends ReferenceData {
    constructor(props) {
        super(props, 'set');
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    addItem = async (entry) => {
        if (!entry['value'].value) return;

        this.props.displayLoadingModal(true);
        const username = await this.defaultEntryComment();
        const [value, source] = [entry['value'].value, entry['source'].value || username,];

        const response = await APIHelper.addReferenceDataEntry(this.props.type, this.props.name, { value, source });

        if (response.error) {
            this.props.showError(response.message);
        } else {
            if (response.number_of_elements > this.state.tableData.length) { // only update the table, if the entry actually has been added
                let updateData = this.state.allEntries;
                updateData.push({ value, source, id: value, first_seen: Date.now(), last_seen: Date.now() });
                this.tableChanged('new', updateData);
                this.updateMetaData(response);
            }
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
            const value = entry.id
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, value);
            updateData = updateData.filter(e => e.value !== value);
        }

        if (response.error || response.number_of_elements >= this.state.tableData.length) {
            this.props.showError(response.message || 'Unspecified error while trying to delete value');
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
            // since we just care about the correct format of the values, i.e. one per line
            if (entries.containsHeaders.value) tuples = tuples.slice(1);

            const data = [];
            for (const tuple of tuples) {
                const [value,] = tuple;
                data.push(value);
            }

            this.bulkAdd(data);
        };

        if (entries.file && entries.file.value)
            reader.readAsText(entries.file.value);
    }

    bulkAddItems = async (entries) => {
        let data = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddSeparator.value) // Remove new lines 
            .split(entries.bulkAddSeparator.value) // split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values
        data = [...new Set(data),]; // remove duplicates

        this.bulkAdd(data);
    }

    /**
     * Data is expected to be a regular json object. The data is first uploaded to QRadar and upon success the table is updated locally.
     * This might potentially lead to inconsistencies as we mirror the 'expected' state which does not necessarily match the 'real' state. 
     * A potential workaround would be to directly reload the full map, however, this might be resource intensive so we accept potential temporary inconsistencies
     * as they can be resolved by clicking the reload button if necessary.
     * {"value1","value2","value3",}
     */
    bulkAdd = async (data) => {
        this.props.displayLoadingModal(true);

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let tableData = this.state.allEntries;

            for (const value of data) {
                tableData.push({ value, id: value, source: 'reference data api', first_seen: Date.now(), last_seen: Date.now() });
            }
            // remove new duplicate values
            tableData = this.removeDuplicates(tableData);

            this.tableChanged('new', tableData);
            this.updateMetaData(response);
        }
        this.props.displayLoadingModal(false);
    }

    exportItems = () => this.download(this.props.name, this.state.allEntries);

    removeDuplicates = (data) => {
        return data
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.value === entry.value
                ))
            );
    }

    parseResponseData = (response) => {
        const data = [];
        if (response.number_of_elements > 0) {
            response.data.forEach(element => {
                if (element.value !== undefined) {
                    element.id = element.value;
                    data.push(element);
                }
            });
        }
        return data;
    }

    testValue = (entry, searchText, isRegexSearch) => {
        if (!entry.value) return false;
        let matches = false;
        if (isRegexSearch) matches = entry.value.match(searchText);
        else matches = entry.value.toLowerCase().includes(searchText.toLowerCase());

        return matches;
    }
}



export default ReferenceSet;
