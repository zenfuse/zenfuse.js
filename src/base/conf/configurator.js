const confSymbol = Symbol.for('zenfuse.configuration');

const configuratorSymbol = Symbol('_zenfuseConfiguratorSingleton');

/**
 * Singleton for manipulating global configurations
 */
class ZenfuseConfigurator {
    constructor() {
        if (global[configuratorSymbol]) {
            return global[configuratorSymbol];
        }

        if (!global[confSymbol]) {
            global[confSymbol] = new Map();
        }

        global[configuratorSymbol] = this;
    }

    get(key) {
        return global[confSymbol].get(key);
    }

    set(key, value) {
        return global[confSymbol].set(key, value);
    }

    delete(key) {
        return global[confSymbol].delete(key);
    }

    has(key) {
        return global[confSymbol].has(key);
    }
}

module.exports = new ZenfuseConfigurator();
