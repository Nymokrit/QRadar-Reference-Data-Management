import * as APIHelper from '../Util/APIHelper';
import fileSaver from 'file-saver';
import { QRadar } from 'qjslib';


let username;
export async function defaultEntryComment() {
    if (username) return username;
    try {
        const entry = await QRadar.getCurrentUser();
        if (entry && !entry.error) username = entry.username;
    } catch (e) { console.log(e); };
    return username;
}

export function updateMetaData(data) {
    const metaData = this.state.metaData;
    metaData.number_of_elements = data.number_of_elements;
    this.setState({ metaData: metaData, });
    this.props.dataUpdated();
}

export async function loadData(key, reload) {
    this.loadDependents(); // async load dependents

    let response;
    let stepSize = 5000;
    let numElements = this.props.size;
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

        // this.props.size is unknown if the RefData is accessed by URL directly
        // so we only set numElements to a value if we know the definite value for sure
        if (!this.props.size && response.number_of_elements) numElements = response.number_of_elements;

        let data = reload ? [] : this.state.allEntries;
        reload = false;
        // For map of sets and tables, num_of_elements is #outer_key*#inner_keys, hence at some point we load 
        // a range that contains no data. At that point, we skip the rest
        if (response.data) {
            const newData = this.parseResponseData(response);
            if (data) data.push(...newData);
            else data = newData;

            await this.setState({ allEntries: data, });
            delete response.data; // We will use the remaining object for displaying meta data
            this.tableChanged();

            if (numElements && numElements > to) {
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
    this.props.displayLoadingModal(true);

    const purgeDataCallback = (response) => {
        this.tableChanged('new', []);
        this.updateMetaData(response);
        this.props.displayLoadingModal(false);
    };

    await APIHelper.purgeReferenceData(this.props.type, this.props.name, purgeDataCallback);
}


export function download(name, content, hasInnerKey, hasOuterKey) {
    let exportString = '';
    if (hasOuterKey) exportString += 'parentKey,';
    if (hasInnerKey) exportString += 'key,';
    exportString += 'value,first_seen,last_seen,source\n';
    for (const value of content) {
        if (hasOuterKey) exportString += '"' + value.outer_key.replace(/"/g, '""') + '",';
        if (hasInnerKey) exportString += '"' + value.key.replace(/"/g, '""') + '",';
        exportString += '"' + value.value.replace(/"/g, '""') + '","' + value.first_seen + '","' + value.last_seen + '","' + value.source.replace(/"/g, '""') + '"\n';
    }

    const blob = new Blob([exportString,], { type: "text/csv", });
    fileSaver.saveAs(blob, `${name}.csv`);
}