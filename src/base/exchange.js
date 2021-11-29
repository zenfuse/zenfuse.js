const got = require('got');
const mergeObjects = require('deepmerge');

const pkg = require('../../package.json');

/**
 * @typedef {object} BaseOptions
 * @property {import('got').ExtendOptions} httpClientOptions
 * @property {object} ws
 * @property {string} ws.prefixUrl
 */

/**
 * @type {BaseOptions}
 */
const DEFAULT_BASE_OPTIONS = {
    httpClientOptions: {
        responseType: 'json',
        resolveBodyOnly: true,
        headers: {
            'user-agent': `${pkg.name}/${pkg.version} (${pkg.homepage})`,
        },
    },
};

class ExchangeBase {
    /**
     * @param {BaseOptions} options
     */
    constructor(options) {
        const assignedOptions = mergeObjects(DEFAULT_BASE_OPTIONS, options);

        this.options = assignedOptions;

        this.fetcher = got.extend(this.options.httpClientOptions);
    }
}

module.exports = ExchangeBase;
