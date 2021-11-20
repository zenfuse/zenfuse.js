const BinanceBase = require('../base');

const {
    getOnlySpotMarkets,
    structualizeMarkets,
    getAllTickersFromSymbols,
    transformOrderForCreation,
} = require('../functions');

/**
 * Binance class for spot wallet Api
 * @important should have same
 */
class BinanceSpot extends BinanceBase {
    constructor(httpClientOptions) {
        super(httpClientOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const responseBody = await this.fetch('api/v3/exchangeInfo').catch(
            (err) => {
                throw err;
            },
        );

        const spotMarkets = getOnlySpotMarkets(responseBody.symbols);

        const tickers = getAllTickersFromSymbols(spotMarkets);

        return {
            tickers,
            responseBody,
        };
    }

    /**
     * @returns Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const responseBody = await this.fetch('api/v3/exchangeInfo').catch(
            (err) => {
                throw err;
            },
        );

        const spotMarkets = getOnlySpotMarkets(responseBody.symbols);

        const markets = structualizeMarkets(spotMarkets);

        return {
            markets,
            responseBody,
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
        this._checkInstanceHasKeys();

        const createdOrder = await this.fetch('api/v3/order', {
            method: 'POST',
            searchParams: transformOrderForCreation(order),
        });

        return {
            ...createdOrder,
            responseBody: createdOrder,
        };
    }
}

module.exports = BinanceSpot;
