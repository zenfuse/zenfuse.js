const BinanceBase = require('../base');

const {
    getOnlySpotMarkets,
    structualizeMarkets,
    getAllTickers,
} = require('../functions');

/**
 *
 */
class BinanceSpot extends BinanceBase {
    constructor(httpClientOptions) {
        super(httpClientOptions);
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

        const spotMarkets = getOnlySpotMarkets(responceBody.symbols);

        const tickers = getAllTickers(spotMarkets);

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
        this.checkInstanceHasKeys();

        return order;
    }
}

module.exports = BinanceSpot;
