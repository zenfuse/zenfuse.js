const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const {
    getOnlySpotMarkets,
    structualizeMarkets,
    getAllTickers,
} = require('./functions');

/**
 * Http client options specialy for this exchange
 * @type {import('got').ExtendOptions}
 */
const EXCHANGE_HTTP_CLIENT_OPTIONS = {
    prefixUrl: 'https://api.binance.com/',
};

/**
 * Binance base class for method whitch included in any wallet type
 * @important Any class what extends ExchangeBase should have same public interface
 */
class BinanceBase extends ExchangeBase {
    #keys = null;

    /**
     * @param {import('got').ExtendOptions} httpClientOptions User defined options for in http client lib
     */
    constructor(httpClientOptions) {
        const options = Object.assign(
            EXCHANGE_HTTP_CLIENT_OPTIONS,
            httpClientOptions,
        );
        super(options);
    }

    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey
     * @returns {this}
     */
    auth(keys) {
        this.#keys.publicKey = keys.publicKey;
        this.#keys.privateKey = keys.privateKey;
        return this;
    }

    /**
     * Ping binance servers
     */
    async ping() {
        await this.fetch('api/v3/ping');
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const responceBody = await this.fetch('api/v3/exchangeInfo').catch(
            (err) => {
                throw err;
            },
        );

        const tickers = getAllTickers(responceBody.symbols);

        return {
            tickers,
            responceBody,
        };
    }

    /**
     * @returns Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const responceBody = await this.fetch('api/v3/exchangeInfo').catch(
            (err) => {
                throw err;
            },
        );

        const spotMarkets = getOnlySpotMarkets(responceBody.symbols);

        const markets = structualizeMarkets(spotMarkets);

        return {
            markets,
            responceBody,
        };
    }

    #checkInstanceHasKeys() {
        if (this.#keys) {
            throw new NotAuathenticatedError();
        }
    }

    #dummy() {
        const BYBIT = {
            name: 'BTCUSDT',
            alias: 'BTCUSDT',
            status: 'Trading',
            base_currency: 'BTC',
            quote_currency: 'USDT',
            price_scale: 2,
            taker_fee: '0.00075',
            maker_fee: '-0.00025',
            leverage_filter: {
                min_leverage: 1,
                max_leverage: 100,
                leverage_step: '0.01',
            },
            price_filter: {
                min_price: '0.5',
                max_price: '999999.5',
                tick_size: '0.5',
            },
            lot_size_filter: {
                max_trading_qty: 100,
                min_trading_qty: 0.001,
                qty_step: 0.001,
            },
        };

        // ===

        const FTX = {
            name: 'BTC-0628',
            baseCurrency: null,
            quoteCurrency: null,
            quoteVolume24h: 28914.76,
            change1h: 0.012,
            change24h: 0.0299,
            changeBod: 0.0156,
            highLeverageFeeExempt: false,
            minProvideSize: 0.001,
            type: 'future',
            underlying: 'BTC',
            enabled: true,
            ask: 3949.25,
            bid: 3949,
            last: 10579.52,
            postOnly: false,
            price: 10579.52,
            priceIncrement: 0.25,
            sizeIncrement: 0.0001,
            restricted: false,
            volumeUsd24h: 28914.76,
        };

        // ===

        const BINANCE = {
            symbol: 'ETHBTC',
            status: 'TRADING',
            baseAsset: 'ETH',
            baseAssetPrecision: 8,
            quoteAsset: 'BTC',
            quotePrecision: 8, // will be removed in future api versions (v4+)
            quoteAssetPrecision: 8,
            baseCommissionPrecision: 8,
            quoteCommissionPrecision: 8,
            orderTypes: [
                'LIMIT',
                'LIMIT_MAKER',
                'MARKET',
                'STOP_LOSS',
                'STOP_LOSS_LIMIT',
                'TAKE_PROFIT',
                'TAKE_PROFIT_LIMIT',
            ],
            icebergAllowed: true,
            ocoAllowed: true,
            quoteOrderQtyMarketAllowed: true,
            isSpotTradingAllowed: true,
            isMarginTradingAllowed: true,
            filters: [
                //These are defined in the Filters section.
                //All filters are optional
            ],
            permissions: ['SPOT', 'MARGIN'],
        };

        return rawMarkets;
    }
}

module.exports = BinanceBase;
