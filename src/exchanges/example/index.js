const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');

/**
 * Http client options specialy for this exchange
 * @type {import('got').ExtendOptions}
 */
const EXCHANGE_HTTP_CLIENT_OPTIONS = {
    prefixUrl: 'https://api.example.com/',
};

/**
 * The example of exchange class.
 * @important Any class what extends ExchangeBase should have same public interface
 */
class ExchangeName extends ExchangeBase {
    #authenticated = false;
    #keys = null;

    /**
     * @note Constructor checks connection to exchange API
     *
     * @param {import('got').ExtendOptions} httpClientOptions User defined options for in lib http client
     */
    constructor(httpClientOptions) {
        const options = Object.assign(EXCHANGE_HTTP_CLIENT_OPTIONS, httpClientOptions);
        super(options);
    }

    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey
     * @param {string} keys.addonKey
     */
    auth({ publicKey, privateKey, addonKey }) {
        this.#authenticated = true;
        this.#keys = { publicKey, privateKey, addonKey };
    }

    /// Public API ///

    fetchMarkets() {}
    fetchTickers() {}

    /// Private API ///

    spot = {
        createOrder() {},
        cancelOrder() {},
        getUserEventStream() {},
        getMarketEventsStream() {},
    };

    /// Private methods ///

    #checkInstanceHasKeys() {
        if (!this.#authenticated) {
            throw new NotAuathenticatedError();
        }
    }
}

module.exports = ExchangeName;
