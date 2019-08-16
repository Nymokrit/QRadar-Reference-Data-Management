export const constructPath = (...args) => {
    return (args).map((x) => (doubleEncode(x))).filter((x) => (x)).join('/');
};

export function doubleEncode(input) {
    return input ? encodeURIComponent(encodeURIComponent(input)) : undefined;
};
