const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

/**
 * Parse binance symbol from `BTCETH` and returns base an quote ticker from it
 *
 * @param {string} bSymbol Ticker pair from binance like `ETHBUSD`
 * @param {object} binanceCache Binance cache object
 * @param {string[]} binanceCache.ticker All binance tickers
 * @param {{
 *      [ticker:string]: string[]
 * }} binanceCache.parsedSymbols All tickers with pairs
 * @param binanceCache.tickers
 * @returns {[string, string]} Base and quote ticker
 */
const parseBinanceSymbol = (bSymbol, { tickers, parsedSymbols }) => {
    let quoteTicker;
    let baseTicker;

    while (!quoteTicker) {
        baseTicker = tickers.find((ticker) => bSymbol.startsWith(ticker));

        if (!baseTicker) {
            throw new Error(
                `Zenfuse cannot find base ticker in ${bSymbol} symbol`,
            );
        }

        quoteTicker = bSymbol.substring(baseTicker.length);

        const isQuoteTickerExists = parsedSymbols[baseTicker].some((quote) => {
            return quoteTicker === quote;
        });

        if (!isQuoteTickerExists) continue;

        return [baseTicker, quoteTicker];
    }

    throw new Error(
        `Zenfuse cannot find quote ticker of ${baseTicker} in ${bSymbol} symbol`,
    );
};

module.exports = {
    createHmacSignature,
    parseBinanceSymbol,
};
