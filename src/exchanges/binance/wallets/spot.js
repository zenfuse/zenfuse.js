const BinanceBase = require('../base');
const mergeObjects = require('deepmerge');

const {
    getOnlySpotMarkets,
    structualizeMarkets,
    getAllTickersFromSymbols,
    transformOrderValues,
    insertDefaults,
} = require('../functions');
const UserDataStream = require('../streams/userDataStream');

const BINANCE_DEFAULT_SPOT_OPTIONS = {
    defaults: {
        limit: {
            timeInForce: 'GTC',
        },
        market: {},
    },
};

/**
 * Binance class for spot wallet Api
 * @important should have same
 */
class BinanceSpot extends BinanceBase {
    constructor(options) {
        const fullOptions = mergeObjects(BINANCE_DEFAULT_SPOT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const originalResponce = await this.publicFetch(
            'api/v3/exchangeInfo',
        ).catch((err) => {
            throw err;
        });

        const spotMarkets = getOnlySpotMarkets(originalResponce.symbols);

        const tickers = getAllTickersFromSymbols(spotMarkets);

        return {
            tickers,
            originalResponce,
        };
    }

    /**
     * @returns Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const originalResponce = await this.publicFetch(
            'api/v3/exchangeInfo',
        ).catch((err) => {
            throw err;
        });

        const spotMarkets = getOnlySpotMarkets(originalResponce.symbols);

        const markets = structualizeMarkets(spotMarkets);

        return {
            markets,
            originalResponce,
        };
    }

    /**
     * Create new spot order on Binance
     *
     * @param {object} order New order object
     * @param {object} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {'buy'|'sell'} order.side Buy or Sell
     * @param {'market'|'limit'} order.type Market or Limit
     * @param {number|string} order.amount
     * @param {number|string} order.price New order object
     */
    async createOrder(order) {
        const transformedOrder = transformOrderValues(order);

        const fullOrderParams = insertDefaults(
            transformedOrder,
            this.options.defaults,
        );

        const createdOrder = await this.privateFetch('api/v3/order', {
            method: 'POST',
            searchParams: fullOrderParams,
        });

        return {
            createdOrder,
            originalResponce: createdOrder,
        };
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/v3/account');

        const balances = response.balances.map((b) => {
            return {
                ticker: b.asset,
                balance: b.free,
            };
        });

        return {
            balances,
            originalResponce: response,
        };
    }

    getUserDataStream() {
        return new UserDataStream(this);
    }
}

module.exports = BinanceSpot;
