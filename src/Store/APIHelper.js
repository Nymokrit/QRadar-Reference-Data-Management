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
        // if it is a 'common' error, we retry the request once more.
        // E.g. if we run into a timeout, that might be only a temporary network issue
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

    const waitForTaskToComplete = setInterval(async () => {
        if (status === 'CANCELLED' || status === 'CANCELING' || status === 'EXCEPTION' || status === 'CONFLICT') {
            clearInterval(waitForTaskToComplete);
            callback({ error: true, message: response.message, });
        } else if (status === 'COMPLETED') {
            clearInterval(waitForTaskToComplete);
            if (isDependencyCheck) response = await sendAPIRequest(method, taskAPI + '/results', {}, undefined, { 'Allow-hidden': true, });
            callback(response);
        } else {
            response = await sendAPIRequest(method, taskAPI, { fields: fields, }, undefined, { 'Allow-hidden': true, });
            status = response.status;
        }
    }, 500);
}

export async function loadReferenceData(type) {
    const api = `/reference_data/${type}`;
    const method = 'GET';

    return await sendAPIRequest(method, api, undefined, undefined, { 'Allow-hidden': true, });
}

export async function loadReferenceDataValues(type, name, headers) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'GET';

    return await sendAPIRequest(method, api, undefined, undefined, headers);
}

export async function loadReferenceDataDependents(type, name, callback, skipWaitForCompletion) {
    const api = `/reference_data/${type}/${name}/dependents`;
    const method = 'GET', fields = 'status, id, message';

    if (!name) return {};

    const response = await sendAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, });
    const status = response.status || 'CANCELLED'; // If the first request fails, we consider the status cancelled

    if (type === 'maps') type = 'map';
    else if (type === 'sets') type = 'set';

    const apiDependentTask = `/reference_data/${type}_dependent_tasks/${response.id}`;
    if (skipWaitForCompletion) return response;
    else checkTaskStatus(apiDependentTask, status, callback, true);
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
        const response = await sendAPIRequest(method, api, { purge_only: purge_only, });
        const status = response.status;

        if (type === 'maps') type = 'map';
        else if (type === 'sets') type = 'set';

        const apiDeleteTask = `/reference_data/${type}_delete_tasks/${response.id}`;
        if (!callback || skipWaitForCompletion) return response;
        else checkTaskStatus(apiDeleteTask, status, callback);
    } catch (e) {
        callback({ error: e, message: e.message, });
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