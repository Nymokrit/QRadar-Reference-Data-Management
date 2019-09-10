import * as RefDataHelper from '../RefDataHelper';
import * as APIHelper from '../../Store/APIHelper';
import ReferenceData from './ReferenceData';

class ReferenceMap extends ReferenceData {
    constructor(props) {
        super(props, 'map');
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

    exportItems() {
        RefDataHelper.download(this.props.name, this.state.allEntries, true);
    }

    // Entry should consist of an JS Object of the form {key: 'someKey', value: 'someVal'}
    async addItem(entry) {
        if (!entry['value'].value || !entry['key'].value) {
            this.props.showError('Cannot add an empty value');
            return;
        }
        const username = await RefDataHelper.defaultEntryComment();
        const parsedEntry = { key: entry['key'].value, value: entry['value'].value, source: entry['source'].value || username, };

        super.addItem(parsedEntry);
    }

    // Entries should be an array containing the values to be deleted
    async deleteItem(entries) {
        if (!entries || !entries.length) return;
        this.props.toggleLoading();
        let response;
        let updateData = this.state.allEntries;

        for (const key of entries) {
            const keyIndex = updateData.findIndex((value) => (value.key === key));
            response = await APIHelper.deleteReferenceDataEntry(this.props.type, this.props.name, key, { value: updateData[keyIndex].value, });
            updateData = this.updateData(updateData, { key: key, }, false);
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
        // const regexEntries = new RegExp(entries.bulkAddEntriesSeparator.value, 'g');
        // const regexKeyValue = new RegExp(entries.bulkAddKeyValueSeparator.value, 'g');
        this.props.toggleLoading();

        const pairs = entries.bulkAddData.value
            .replace(/\r?\n/g, entries.bulkAddEntriesSeparator.value) // Remove new lines 
            .split(entries.bulkAddEntriesSeparator.value)
            .map(value => value.trim())
            .filter(value => value);

        let newData = [];

        const data = {};

        for (const pair of pairs) {
            const [key, value,] = pair.split(entries.bulkAddKeyValueSeparator.value).map(value => value.trim()).filter(x => x);
            data[key] = value;
            newData.push({ key: key, value: value, id: key, source: 'reference data api', });
        }

        // We remove duplicate keys but keep the newest key=value pair
        // This is be the expected behaviour when duplicate keys are passed to the API so we imitate the same
        newData = newData
            .reverse()
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.key === entry.key
                ))
            )
            .reverse();

        const response = await APIHelper.bulkAddReferenceDataEntry(this.props.type, this.props.name, data);

        if (response.error) {
            this.props.showError(response.message);
        } else {
            let oldData = this.state.allEntries;
            oldData.push(...newData);
            // remove new duplicate keys and keep the newest ones
            oldData = oldData.reverse()
                .filter((entry, index, self) =>
                    index === self.findIndex((e) => (
                        e.key === entry.key
                    ))
                )
                .reverse();

            this.tableChanged('new', oldData);
            this.updateMetaData(response);
        }
        this.props.toggleLoading();
    }

    updateData(currentState, value, isAdd) {
        let updateData = currentState;
        if (isAdd) updateData.push({ key: value.key, value: value.value, id: value.key, source: value.source, });
        else updateData = updateData.filter(e => e.key !== value.key);

        updateData = updateData
            .reverse()
            .filter((entry, index, self) =>
                index === self.findIndex((e) => (
                    e.key === entry.key
                ))
            )
            .reverse();

        return updateData;
    }

    parseResponseData(response) {
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

    testValue(entry, searchText, isRegexSearch) {
        if (!entry.value || !entry.key) return false;

        let matches = false;
        if (isRegexSearch) matches = entry.value.match(searchText) || entry.key.match(searchText);
        else matches = entry.value.toLowerCase().includes(searchText.toLowerCase()) || entry.key.toLowerCase().includes(searchText.toLowerCase());

        return matches;
    }
}



export default ReferenceMap;
