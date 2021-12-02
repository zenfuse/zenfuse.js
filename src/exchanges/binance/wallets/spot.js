const BinanceBase = require('../base');
const mergeObjects = require('deepmerge');

const {
    getOnlySpotMarkets,
    transformMarketString,
    structualizeMarkets,
    getAllTickersFromSymbols,
    transformOrderValues,
    insertDefaults,
    validateOrderForCanceling,
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
    constructor(options = {}) {
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
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
     */
    async fetchPrice(market) {
        const params = {};

        if (market) {
            params.symbol = transformMarketString(market);
        }

        const responce = await this.publicFetch('api/v3/ticker/price', {
            searchParams: params,
        });

        return {
            originalResponce: responce,
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

    /**
     * Cancel an active order
     *
     * @important Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      So if you know order symbol, better pass it to didn't make unnecessary HTTP requests.
     *
     * @param {object} order Order object to delete
     * @param {string} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {string} order.id Binance order id
     */
    async cancelOrder(order) {
        validateOrderForCanceling(order);

        if (!order.symbol) {
            // 	┬──┬ ノ(ò_óノ) Binance api kills nerve cells
            const openOrders = await this.fetchOpenOrders();

            const orderToDelete = openOrders.originalResponce.find((o) => {
                return o.orderId === order.id;
            });

            if (!orderToDelete) {
                throw new Error('Order symbol not found'); // TODO: Specific error desc
            }

            order.symbol = orderToDelete.symbol;
        }

        const deletedOrder = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: order.symbol,
                orderId: order.id.toString(),
            },
        });

        return {
            originalResponce: deletedOrder,
        };
    }

    async fetchOpenOrders() {
        const openOrders = await this.privateFetch('api/v3/openOrders');

        // TODO: order status object

        return {
            openOrders,
            originalResponce: openOrders,
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
