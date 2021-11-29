const got = require('got');
const mergeObjects = require('deepmerge');

const pkg = require('../../package.json');

/**
 * @typedef {object} ExtraWsOptions
 * @property {string} prefixUrl When specified, `prefixUrl` will be
 *      prepended to websocket `url`.
 *      **Note:** Path will be overwritten
 */

/**
 * @typedef {object} BaseOptions
 * @property {import('got').ExtendOptions} httpClientOptions This object will be passed to `got.extend`
 * @property {ExtraWsOptions & import('ws').ClientOptions} wsClientOptions Websocket client options based on `ws` lib with some extra parameters
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
    wsClientOptions: {
        headers: {
            'user-agent': `${pkg.name}/${pkg.version} (${pkg.homepage})`,
        },
        rejectUnauthorized: true,
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
