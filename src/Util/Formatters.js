import dateformat from 'dateformat';



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