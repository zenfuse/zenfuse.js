/* eslint-disable no-undef */
const inspector = require('inspector');

const shouldDebugZenfuse = process.env.ZENFUSE_DEBUG === 'true';

/**
 * @type {ProxyHandler}
 */
const consoleHandler = {
    apply: (target, _that, args) => {
        if (!shouldDebugZenfuse) return;

        if (args.every((i) => typeof i === 'string')) {
            // args.unshift('zenfuse');
        }

        target(...args);
    },
};

module.exports = {
    info: new Proxy(inspector.console.info, consoleHandler),
    log: new Proxy(inspector.console.log, consoleHandler),
    warn: new Proxy(inspector.console.warn, consoleHandler),
    error: new Proxy(inspector.console.error, consoleHandler),
    trace: new Proxy(inspector.console.trace, consoleHandler),
};
