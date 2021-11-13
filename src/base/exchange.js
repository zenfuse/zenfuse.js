const WebSocket = require('ws');
const got = require('got');

const pkg = require('../../package.json');

class ExchangeBase {
    defaultHttpClientOptions = {
        responseType: 'json',
        headers: {
            'user-agent': `${pkg.name}/${pkg.version} (${pkg.homepage})`,
        },
    };

    /**
     * @param {got.ExtendOptions} httpClientOptions
     * @param {string | URL} agentOptions.prefixUrl
     */
    constructor(httpClientOptions) {
        const options = Object.assign(this.defaultHttpClientOptions, httpClientOptions);

        this.fetcher = got.extend(options);
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {string} endpoint;
     * @returns {object};
     */
    fetch(endpoint) {
        return this.fetcher(endpoint);
    }

    /**
     * Get websocket connection
     *
     * @param {*} url
     * @param {WebSocket} onMessage
     */
    getWebSocketConnection(url, onMessage) {
        const ws = new WebSocket(url);

        ws.on('message', onMessage);

        ws.on('error', this.handleWebSocketError.bind(this));
    }

    /**
     * @param {WebSocket.ErrorEvent} err
     * @private
     */
    handleWebSocketError(err) {
        throw err;
    }
}

module.exports = ExchangeBase;
