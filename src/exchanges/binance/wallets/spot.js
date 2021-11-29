const BinanceBase = require('../base');

const {
    getOnlySpotMarkets,
    structualizeMarkets,
    getAllTickersFromSymbols,
    transformOrderForCreation,
} = require('../functions');
const UserDataStream = require('../streams/userDataStream');

/**
 * Binance class for spot wallet Api
 * @important should have same
 */
class BinanceSpot extends BinanceBase {
    constructor(options) {
        super(options);
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
        const createdOrder = await this.privateFetch('api/v3/order', {
            method: 'POST',
            searchParams: transformOrderForCreation(order),
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
