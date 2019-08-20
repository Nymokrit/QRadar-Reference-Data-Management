import axios from 'axios';
import { QRadar } from 'qappfw';
import querystring from 'querystring';
import Config from '../Util/Config';
import * as Util from '../Util/Util';

const isProd = QRadar.getCurrentUser();
const csrfHeader = QRadar.getCookie(QRadar.QRADAR_CSRF);

async function sendAPIRequest(method, path, query, data, headers) {
    const httpClient = axios.create();
    const _headers = Object.assign({}, Config.axiosHeaders, (headers ? headers : {}));
    // httpClient.defaults.timeout = 10;

    console.time(`${method} ${path}`);

    let response = { data: [], };
    if (isProd) _headers[QRadar.QRADAR_CSRF] = csrfHeader;
    try {
        response = await httpClient.request({
            method: method,
            url: Config.apiRoot + path + (query ? ('?' + querystring.stringify(query)) : ''),
            data: (data ? data : {}),
            headers: _headers,
        });
    } catch (error) {
        console.fail(`Failed loading data from ${path}`);
        console.timeEnd(`${method} ${path}`);
        if (!error.response || !error.response.data) return { error: error, message: 'Failed performing the requested network operation', };
        else return { error: error, message: error.response.data.message, };
    }

    console.timeEnd(`${method} ${path}`);
    return response.data;
}

export async function checkTaskStatus(taskAPI, initialResponse, callback, isDependencyCheck) {
    const method = 'GET', fields = 'id, status, message';
    let response = initialResponse;
    let status = initialResponse.status;

    let counter = 0;
    const waitForTaskToComplete = setInterval(async () => {
        counter++;
        if (status === 'CANCELLED' || status === 'CANCELING' || status === 'EXCEPTION' || status === 'CONFLICT' || counter > 50) {
            clearInterval(waitForTaskToComplete);
            callback({ error: true, message: response.message, });
        } else if (status === 'COMPLETED') {
            clearInterval(waitForTaskToComplete);
            if (isDependencyCheck) response = await sendAPIRequest(method, taskAPI + '/results', {});
            callback(response);
        } else {
            response = await sendAPIRequest(method, taskAPI, { fields: fields, });
            status = response.status;
        }
    }, 500);
}

export async function loadReferenceData(type) {
    const api = `/reference_data/${type}`;
    const method = 'GET';

    return await sendAPIRequest(method, api);
}

export async function createReferenceData(type, query) {
    const api = `/reference_data/${type}`;
    const method = 'POST';

    return await sendAPIRequest(method, api, query);
}

export async function loadReferenceDataValues(type, name, headers) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'GET';

    return await sendAPIRequest(method, api, undefined, undefined, headers);
}

export async function loadReferenceDataDependents(type, name, callback, skipWaitForCompletion) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}/dependents`;
    const method = 'GET', fields = 'status, id, message';

    try {
        if (!name) throw {};

        const response = await sendAPIRequest(method, api, { fields: fields, });
        if (!response || !response.id) throw {};

        const status = response.status || 'CANCELLED'; // If the first request fails, we consider the status cancelled
        if (type === 'maps') type = 'map';
        else if (type === 'sets') type = 'set';

        const apiDependentTask = `/reference_data/${type}_dependent_tasks/${response.id}`;
        if (skipWaitForCompletion) return response;
        else checkTaskStatus(apiDependentTask, status, callback, true);
    } catch (e) {
        callback({ error: e, message: 'Unable to load dependents', });
    }
}

export async function addReferenceDataEntry(type, name, values) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'POST';

    return await sendAPIRequest(method, api, values);
}

export async function deleteReferenceDataEntry(type, name, key, values) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}/${Util.doubleEncode(key)}`;
    const method = 'DELETE';

    return await sendAPIRequest(method, api, values);
}

export async function purgeReferenceData(type, name, callback, skipWaitForCompletion) {
    deleteReferenceData(type, name, callback, true, skipWaitForCompletion);
}

export async function deleteReferenceData(type, name, callback, purge_only = false, skipWaitForCompletion = false) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'DELETE';

    try {
        if (!name) throw {};

        const response = await sendAPIRequest(method, api, { purge_only: purge_only, });
        if (!response || !response.id) throw {};

        const status = response.status;

        if (type === 'maps') type = 'map';
        else if (type === 'sets') type = 'set';

        const apiDeleteTask = `/reference_data/${type}_delete_tasks/${response.id}`;
        if (!callback || skipWaitForCompletion) return response;
        else checkTaskStatus(apiDeleteTask, status, callback);
    } catch (e) {
        callback({ error: e, message: e.message || 'Unable to delete Reference Data', });
    }
}

export async function deleteReferenceDataInnerEntry(type, name, key, innerKey, values) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}/${Util.doubleEncode(key)}/${Util.doubleEncode(innerKey)}`;
    const method = 'DELETE';

    return await sendAPIRequest(method, api, values);
}

export async function bulkAddReferenceDataEntry(type, name, values) {
    const api = `/reference_data/${type}/bulk_load/${Util.doubleEncode(name)}`;
    const method = 'POST';
    const headers = {};
    headers['Content-Type'] = 'application/json';

    return await sendAPIRequest(method, api, {}, values, headers);
}