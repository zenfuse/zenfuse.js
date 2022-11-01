const confSymbol = Symbol.for('zenfuse.configuration');

if (!global[confSymbol]) {
    global[confSymbol] = new Map();
}

module.exports = {
    get(key) {
        return global[confSymbol].get(key);
    },

    set(key, value) {
        return global[confSymbol].set(key, value);
    },

    delete(key) {
        return global[confSymbol].delete(key);
    },

    has(key) {
        return global[confSymbol].has(key);
    },
};
