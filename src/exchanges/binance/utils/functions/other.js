const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

const linkOriginalPayload = (object, originalPayload) => {
    Object.defineProperty(object, Symbol.for('zenfuse.originalPayload'), {
        value: originalPayload,
        enumerable: false,
        configurable: false,
        writable: false,
    });
};

/**
 * Parse binance symbol from `BTCETH` and returns base an quote ticker from it
 *
 * @param {string} bSymbol Ticker pair from binance like `ETHBUSD`
 * @param {object} binanceCache Binance cache object
 * @param {string[]} binanceCache.ticker All binance tickers
 * @param {{
 *      [ticker:string]: string[]
 * }} binanceCache.optimizedPairs All tickers with pairs
 * @returns {[string, string]} Base and quote ticker
 */
const parseBinanceSymbol = (bSymbol, { tickers, optimizedPairs }) => {
    let quoteTicker;

    const baseTicker = tickers.find((ticker) => bSymbol.startsWith(ticker));

    if (!baseTicker) {
        throw new Error(`Zenfuse cannot find base ticker in ${bSymbol} symbol`);
    }

    quoteTicker = bSymbol.substring(baseTicker.length);

    const isQuoteTickerExists = optimizedPairs[baseTicker].some((quote) => {
        return quoteTicker === quote;
    });

    if (!isQuoteTickerExists) {
        throw new Error(
            `Zenfuse cannot find quote ticker of ${baseTicker} in ${bSymbol} symbol`,
        );
    }

    return [baseTicker, quoteTicker];
};

module.exports = {
    createHmacSignature,
    linkOriginalPayload,
    parseBinanceSymbol,
};
