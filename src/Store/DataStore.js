class DataStore {
    static hasLoaded = false;

    static async init() {

        DataStore.refData = {
            'sets': { key: 'sets', label: 'Reference Sets', nodes: {}, isOpen: false, },
            'maps': { key: 'maps', label: 'Reference Maps', nodes: {}, isOpen: false, },
            'map_of_sets': { key: 'map_of_sets', label: 'Reference Map of Sets', nodes: {}, isOpen: false, },
            'tables': { key: 'tables', label: 'Reference Tables', nodes: {}, isOpen: false, },
        };
        DataStore.allRefData = [];
        DataStore.currentRefDataEntry = {};
        DataStore.hasLoaded = true;

    }
}

export default DataStore;