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
        const options = Object.assign(
            this.defaultHttpClientOptions,
            httpClientOptions,
        );

        this.fetcher = got.extend(options);
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {string} endpoint;
     * @returns {object};
     */
    fetch(endpoint) {
        return this.fetcher(endpoint)
            .then((res) => {
                return res.body;
            })
            .catch(this._handleFetcherError);
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

        ws.on('error', this._handleWebSocketError.bind(this));
    }

    /**
     * @param {WebSocket.ErrorEvent} err
     * @private
     */
    _handleWebSocketError(err) {
        throw err;
    }

    /**
     *
     * @param {Error} err
     * @private
     */
    _handleFetcherError(err) {
        throw new (class FetcherError extends err {})();
    }
}

module.exports = ExchangeBase;
