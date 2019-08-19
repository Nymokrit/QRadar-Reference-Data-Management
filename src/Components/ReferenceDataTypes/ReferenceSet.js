import * as APIHelper from '../../Store/APIHelper';
import * as RefDataHelper from '../RefDataHelper';
import ReferenceData from './ReferenceData';

class ReferenceSet extends ReferenceData {
    constructor(props) {
        super(props, 'set');
    }

    async importItems(entries) {
        const reader = new FileReader();

        reader.onloadend = () => {
            const text = reader.result;
            const data = {
                bulkAddSeparator: entries.bulkAddSeparator,
                bulkAddData: { value: text, },
            };
            this.bulkAddItems(data);
        };

        reader.readAsText(entries.file.value);
    }

    exportItems() {
        RefDataHelper.download(this.props.name, this.state.allEntries);
    }

    // Entry should consist of an JS Object of the form {value: 'someVal'}
    async addItem(entry) {
        if (!entry['value'].value) {
            this.props.showError('Cannot add an empty value');
            return;
        }
        const parsedEntry = { value: entry['value'].value, source: entry['source'].value || RefDataHelper.defaultEntryComment, };

        super.addItem(parsedEntry);
    }

    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const value of entries) {
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, value);
            updateData = this.updateData(updateData, { value: value, }, false);
        }

        if (response.error) {
            this.props.showError(response.message);
        } else {
            this.tableChanged('new', updateData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    async bulkAddItems(entries) {
        // const regexEntries = new RegExp(entries.bulkAddSeparator.value, 'g');
        this.props.toggleLoading();

        let data = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddSeparator.value) // Remove new lines 
            .split(entries.bulkAddSeparator.value) // split based on input value
            .map(value => value.trim()) // remove whitespace
            .filter(value => value); // remove empty values
        data = [...new Set(data),]; // remove duplicates
        const newData = data.map(elem => ({ value: elem, id: elem, source: RefDataHelper.defaultEntryComment, }));
        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let oldData = this.state.allEntries;
            oldData.push(...newData);
            // remove new duplicate values
            oldData = oldData
                .filter((entry, index, self) =>
                    index === self.findIndex((e) => (
                        e.value === entry.value
                    ))
                );
            this.tableChanged('new', oldData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    updateData(currentState, value, isAdd) {
        let updateData = currentState;
        if (isAdd) {
            const indexOfValue = updateData.findIndex((entry) => (value.value === entry.value));
            // value is not yet in ref set
            if (indexOfValue === -1) updateData.push({ value: value.value, id: value.value, source: value.source, });
        }
        else updateData = updateData.filter(e => e.value !== value.value);

        return updateData;
    }

    parseResponseData(response) {
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

    testValue(entry, searchText, isRegexSearch) {
        if (!entry.value) return false;
        let matches = false;
        if (isRegexSearch) matches = entry.value.match(searchText);
        else matches = entry.value.toLowerCase().includes(searchText.toLowerCase());

        return matches;
    }
}



export default ReferenceSet;
