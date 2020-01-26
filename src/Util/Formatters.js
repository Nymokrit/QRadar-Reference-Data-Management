import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dateformat from 'dateformat';

/**
 * Formatter to display either a checkmark (true) or times (false) for a cell depending on the cell's value
 * if the options contain an attribute 'reverse', the default display option is reversed
 */
export function formatBoolRow(cell, row, options) {
    const bool = options.reverse ? !cell : cell;
    return (
        <FontAwesomeIcon
            icon={bool ? 'check' : 'times'}
        />);
}

export function formatTHCenter(col, index) { return 'center'; } // Center some Table Headers

export function formatEdgeTitle(entry, llc) {
    let titleString = '<span class="' + (entry.enabled ? 'enabled' : 'disabled') + '">';
    if (entry.log_source_id) titleString += '[LS ' + entry.log_source_id + ']';
    else if (entry.qid) titleString += '[QID ' + entry.qid + ']';
    else if (entry.low_level_category_id) titleString += '[CAT ' + llc.name + ']';
    else titleString += '[ALL]';
    titleString += ' ($' + (entry.capture_group || '0') + ') ';
    titleString += '</span><span>' + (entry.property_expression) + '</span>';
    return titleString;
}

export function dateFormatter(input) {
    return dateformat(input, 'dd/mmm/yyyy, hh:MM:ss TT');
};

export function ttlFormatter(input) {
    let ttlString = '';
    const parts = input.split(/(\S+\s\S+)/).filter(x => (x.trim())); // each part consists of a number, a space and then the unit
    for (const elem of parts) {
        // not using !== as we want '0' == 0 => true
        if (elem.split(/\s/)[0] != 0) ttlString += ' ' + elem; // eslint-disable-line eqeqeq
    }

    return ttlString;
};