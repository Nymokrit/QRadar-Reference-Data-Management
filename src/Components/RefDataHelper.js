import * as APIHelper from '../Store/APIHelper';
import fileSaver from 'file-saver';
import { QRadar } from 'qjslib';


let username;
export async function defaultEntryComment() {
    if (username) return username;
    try {
        const entry = await QRadar.getCurrentUser();
        if (entry && !entry.error) username = entry.username;
    } catch (e) { console.log(e) };
    return username;
}

export function updateMetaData(data) {
    const metaData = this.state.metaData;
    metaData.number_of_elements = data.number_of_elements;
    this.setState({ metaData: metaData, });
    this.props.dataUpdated();
}

export async function loadData_Normal(key) {
    const response = await APIHelper.loadReferenceDataValues(this.props.type, this.props.name);

    this.setState({ allEntries: this.parseResponseData(response), });
    delete response.data;
    this.setState({ metaData: response, loaded: true, });
    this.tableChanged();
}

export async function loadData(key) {
    this.loadDependents(); // async load dependents

    const numElements = this.props.size;
    let response;
    let stepSize = 5000;
    // If we have more than 250k Elements, we increase the step size, to have a maximum of 50 requests until the data has been loaded
    if (numElements / 50 > stepSize) stepSize = Math.ceil(numElements / 50);

    let from = 0;
    let to = stepSize;
    while (true) {
        const headers = { Range: `items=${from}-${to}`, };

        response = await APIHelper.loadReferenceDataValues(this.props.type, this.props.name, headers);
        if (response.error) {
            console.log('Failed loading all elements');
            this.props.showError(`Unable to load all elements. ${numElements - from} entries have not been loaded.`);
            this.setState({ loaded: true, });
            return;
        }

        let data = this.state.allEntries;
        // For map of sets and tables, num_of_elements is #outer_key*#inner_keys, hence at some point we load 
        // a range that contains no data. At that point, we skip the rest
        if (response.data) {
            const newData = this.parseResponseData(response);
            if (data) data.push(...newData);
            else data = newData;

            await this.setState({ allEntries: data, });
            delete response.data;
            this.tableChanged();

            if (numElements > to) {
                response.number_of_elements = to + 1;
                this.setState({ metaData: response, });

                from = to + 1;
                to += stepSize;
                console.log(`Loading next batch from ${from} to ${to}`);
            } else {
                console.log('Done loading all elements');
                break;
            }
        } else {
            console.log('Last batch did not return any new elements. Terminating');
            break;
        }
    }
    this.setState({ metaData: response, loaded: true, });
}

export async function loadDependents() {
    const loadDependentsCallback = (response) => {
        if (response.error) {
            this.props.showError(`Unable to load dependents`);
            this.setState({ dependentsLoaded: true, });
            return;
        }
        this.setState({ dependents: response, dependentsLoaded: true, });
    };

    APIHelper.loadReferenceDataDependents(this.props.type, this.props.name, loadDependentsCallback);
}

export async function purgeData() {
    this.props.toggleLoading();

    const purgeDataCallback = (response) => {
        this.tableChanged('new', []);
        this.updateMetaData(response);
        this.setState({ selected: [], innerSelected: {}, });
        this.clearSelection();
        this.props.toggleLoading();
    };

    await APIHelper.purgeReferenceData(this.props.type, this.props.name, purgeDataCallback);
}

export function selectionChanged(selection) {
    this.setState({ selected: selection, });
}

export function innerSelectionChanged(key, selection) {
    const selected = this.state.innerSelected;
    selected[key] = selection;
    this.setState({ innerSelected: selected, });
}

export function download(name, content, hasInnerKey, hasOuterKey) {
    let exportString = '';
    if (hasOuterKey) exportString += 'parentKey,';
    if (hasInnerKey) exportString += 'key,';
    exportString += 'value,first_seen,last_seen,source\n';
    for (const value of content) {
        if (hasOuterKey) exportString += value.outer_key + ',';
        if (hasInnerKey) exportString += value.key + ',';
        exportString += value.value + ',' + value.first_seen + ',' + value.last_seen + ',' + value.source + '\n';
    }

    const blob = new Blob([exportString,], { type: "text/csv", });
    fileSaver.saveAs(blob, `${name}.csv`);
}