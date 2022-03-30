const RuntimeError = require('../../../../base/errors/runtime.error');
const BinanceCache = require('../../etc/cache');

/**
 * Parse binance symbol from `BTCETH` and returns base an quote ticker from it
 *
 * @param {string} bSymbol Ticker pair from binance like `ETHBUSD`
 * @param {BinanceCache} binanceCache Binance cache object
 * @returns {[string, string]} Base and quote ticker
 */
const parseBinanceSymbol = (bSymbol, { tickers, parsedSymbols }) => {
    let quoteTicker;
    let baseTicker;

    while (!quoteTicker) {
        baseTicker = tickers.find((ticker) => bSymbol.startsWith(ticker));

        if (!baseTicker) {
            throw new RuntimeError(
                `Cannot find base ticker in ${bSymbol} symbol`,
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
    parseBinanceSymbol,
};
