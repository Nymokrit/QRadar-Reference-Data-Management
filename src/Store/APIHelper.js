
import axios from 'axios';
import querystring from 'querystring';
import Config from '../Util/Config';
import * as Util from '../Util/Util';

let SEC = 'UNDEFINED';
let QRadarCSRF = '';

async function sendAsyncAPIRequest(method, path, query, data, headers) {
    const httpClient = axios.create();
    const _headers = Object.assign({}, Config.axiosHeaders, (headers ? headers : {}));
    // httpClient.defaults.timeout = 10;
    if (!SEC) {
        try {
            const response = await axios.get('getToken');
            if (response.data && response.data.length > 64) throw {};
            SEC = response.data['SEC'];
            QRadarCSRF = response.data['QRadarCSRF'];
            Config.apiRoot = '/api';

            _headers['SEC'] = SEC;
            _headers['QRadarCSRF'] = QRadarCSRF;
            _headers['Allow-hidden'] = true;
        } catch (e) {
            SEC = 'undefined';
        }
    }

    console.time(`${method} ${path}`);

    let response = { data: [], };
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

    // cache[objectHash.sha1({ method: method, path: path, query: query })] = response.data;
    // console.log(JSON.stringify(cache));
    //const t1 = performance.now();
    //console.log(`Network request to ${path}`);
    console.timeEnd(`${method} ${path}`);
    return response.data;
}


export async function loadCEPs() {
    const api = '/config/event_sources/custom_properties/regex_properties';
    const method = 'GET', fields = 'id, identifier, name,use_for_rule_engine';
    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadCEPMapping() {
    const response = [];
    let api = '/config/event_sources/custom_properties/property_expressions';
    const method = 'GET';
    let fields = 'id, identifier, log_source_type_id, regex_property_identifier, regex, enabled, qid, log_source_id, low_level_category_id, capture_group';
    // const fields = 'regex_property_identifier, regex, log_source_type_id, log_source_id, qid';
    let data = await sendAsyncAPIRequest(method, api, { fields: fields, });
    if (data && Array.isArray(data)) data = data.map((elem) => {
        elem.type = 'regex';
        return elem;
    });
    response.push(...(data));

    api = '/config/event_sources/custom_properties/property_leef_expressions';
    fields = 'id, identifier, log_source_type_id, regex_property_identifier, expression, enabled, qid, log_source_id, low_level_category_id';
    data = await sendAsyncAPIRequest(method, api, { fields: fields, });
    if (data && Array.isArray(data)) data = data.map((elem) => {
        elem.type = 'LEEF';
        return elem;
    });
    response.push(...(data));

    api = '/config/event_sources/custom_properties/property_cef_expressions';
    data = await sendAsyncAPIRequest(method, api, { fields: fields, });
    if (data && Array.isArray(data)) data = data.map((elem) => {
        elem.type = 'CEF';
        return elem;
    });
    response.push(...(data));

    api = '/config/event_sources/custom_properties/property_json_expressions';
    data = await sendAsyncAPIRequest(method, api, { fields: fields, });
    if (data && Array.isArray(data)) data = data.map((elem) => {
        elem.type = 'JSON';
        return elem;
    });
    response.push(...(data));
    return response;
}

export async function loadRules() {
    const api = '/analytics/rules_with_data';
    const method = 'GET', fields = 'name, id, identifier, is_building_block, modification_date, creation_date, rule_xml, type, owner, origin, linked_rule_identifier';

    const testReq = await sendAsyncAPIRequest(method, api, { fields: 'id', }, undefined, { 'Allow-hidden': true, });
    if (!testReq || testReq.error) { return []; };
    const len = testReq.length;

    const response = [];
    const promises = [];
    const batchSize = 50;
    for (let i = 0; i < Math.ceil(len / batchSize); i++) {
        promises.push(sendAsyncAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, 'Range': `items=${i * batchSize}-${(i + 1) * batchSize - 1}`, }));
    }

    const data = await Promise.all(promises);
    for (const d of data) {
        response.push(...d);
    }
    return response;
}

export async function loadRule(ruleIdentifier) {
    const api = '/analytics/rules_with_data';
    const method = 'GET', fields = 'name, id, identifier, is_building_block, modification_date, creation_date, rule_xml, type, owner, origin, linked_rule_identifier';
    const filter = `identifier="${ruleIdentifier}"`;

    return await sendAsyncAPIRequest(method, api, { fields: fields, filter: filter, }, undefined, { 'Allow-hidden': true, });
}

export async function loadNewerRules(highestID) {
    const api = '/analytics/rules_with_data';
    const method = 'GET', fields = 'name, id, identifier, is_building_block, modification_date, creation_date, rule_xml, type, owner, origin, linked_rule_identifier';
    const filter = `id>${highestID}`;

    return await sendAsyncAPIRequest(method, api, { fields: fields, filter: filter, }, undefined, { 'Allow-hidden': true, });
}

export async function toggleRuleStatus(ruleId, newStatus) {
    const api = `/analytics/rules/${ruleId}`;
    const method = 'POST', fields = 'name, id, identifier, is_building_block, modification_date, creation_date, rule_xml, type, owner, origin, linked_rule_identifier';

    return await sendAsyncAPIRequest(method, api, { fields: fields, }, { enabled: newStatus, }, { 'Allow-hidden': true, 'Content-Type': 'application/json', });
}

export async function loadRuleDependents(ruleIdentifier, callback, skipWaitForCompletion) {
    const api = `/analytics/rules/${ruleIdentifier}/dependents`;
    const method = 'GET', fields = 'status, id, message';

    const response = await sendAsyncAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, });
    const status = response.status;

    const apiDependentTask = `/analytics/rules/rule_dependent_tasks/${response.id}`;
    if (skipWaitForCompletion) return response;
    else checkTaskStatus(apiDependentTask, status, callback, true);
}

export async function deleteRule(ruleIdentifier, callback, skipWaitForCompletion, isBB) {
    const api = isBB ? `/analytics/building_blocks/${ruleIdentifier}` : `/analytics/rules/${ruleIdentifier}`;
    const method = 'DELETE', fields = 'id, status, message';

    try {
        const response = await sendAsyncAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, });
        if (response.error) {
            // if we cannot find the rule, it doesn't exist with the ID we know, and we should remove it from the table,
            // hence, we do not return an error
            if (response.error.response.data.code === 1002) {
                callback({});
                return;
            }
            else throw (response.error);
        }

        const status = response.status;

        const apiDeleteTask = isBB ? `/analytics/building_blocks/building_block_delete_tasks/${response.id}` : `/analytics/rules/rule_delete_tasks/${response.id}`;
        if (skipWaitForCompletion) return response;
        else checkTaskStatus(apiDeleteTask, status, callback);
    } catch (e) {
        callback({ error: e, message: e.message, });
    }
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
            if (isDependencyCheck) response = await sendAsyncAPIRequest(method, taskAPI + '/results', {}, undefined, { 'Allow-hidden': true, });
            callback(response);
        } else {
            response = await sendAsyncAPIRequest(method, taskAPI, { fields: fields, }, undefined, { 'Allow-hidden': true, });
            status = response.status;
        }
    }, 500);
}

export async function loadRuleGroups() {
    const api = '/analytics/rule_groups';
    const method = 'GET', fields = 'name, id, child_items';

    return await sendAsyncAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, });
}

export async function loadLSTypes() {
    const api = '/config/event_sources/log_source_management/log_source_types';
    const method = 'GET', fields = 'id, name';

    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadLowLevelCategories() {
    const api = '/data_classification/low_level_categories';
    const method = 'GET', fields = 'id, name';

    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadQIDs() {
    const api = '/data_classification/qid_records';
    const method = 'GET', fields = 'qid, name';

    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadLSs() {
    const api = '/config/event_sources/log_source_management/log_sources';
    const method = 'GET', fields = 'type_id';

    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadCustomActions() {
    const api = '/analytics/custom_actions/actions';
    const method = 'GET', fields = 'id, name';

    return await sendAsyncAPIRequest(method, api, { fields: fields, });
}

export async function loadReferenceData(type) {
    const api = `/reference_data/${type}`;
    const method = 'GET';

    return await sendAsyncAPIRequest(method, api, undefined, undefined, { 'Allow-hidden': true, });
}

export async function loadReferenceDataValues(type, name, headers) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'GET';

    return await sendAsyncAPIRequest(method, api, undefined, undefined, headers);
}

export async function loadReferenceDataDependents(type, name, callback, skipWaitForCompletion) {
    const api = `/reference_data/${type}/${name}/dependents`;
    const method = 'GET', fields = 'status, id, message';

    const response = await sendAsyncAPIRequest(method, api, { fields: fields, }, undefined, { 'Allow-hidden': true, });
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

    return await sendAsyncAPIRequest(method, api, values);
}

export async function deleteReferenceDataEntry(type, name, key, values) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}/${Util.doubleEncode(key)}`;
    const method = 'DELETE';

    return await sendAsyncAPIRequest(method, api, values);
}

export async function purgeReferenceData(type, name, callback, skipWaitForCompletion) {
    deleteReferenceData(type, name, callback, true, skipWaitForCompletion);
}

export async function deleteReferenceData(type, name, callback, purge_only = false, skipWaitForCompletion = false) {
    const api = `/reference_data/${type}/${Util.doubleEncode(name)}`;
    const method = 'DELETE';

    try {
        const response = await sendAsyncAPIRequest(method, api, { purge_only: purge_only, });
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

    return await sendAsyncAPIRequest(method, api, values);
}

export async function bulkAddReferenceDataEntry(type, name, values) {
    const api = `/reference_data/${type}/bulk_load/${Util.doubleEncode(name)}`;
    const method = 'POST';
    const headers = {};
    headers['Content-Type'] = 'application/json';

    return await sendAsyncAPIRequest(method, api, {}, values, headers);
}