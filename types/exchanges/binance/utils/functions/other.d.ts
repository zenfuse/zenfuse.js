export function createHmacSignature(data: any, key: any): string;
/**
 * Parse binance symbol from `BTCETH` and returns base an quote ticker from it
 *
 * @param {string} bSymbol Ticker pair from binance like `ETHBUSD`
 * @param {object} binanceCache Binance cache object
 * @param {string[]} binanceCache.ticker All binance tickers
 * @param {{
 *      [ticker:string]: string[]
 * }} binanceCache.parsedSymbols All tickers with pairs
 * @returns {[string, string]} Base and quote ticker
 */
export function parseBinanceSymbol(bSymbol: string, { tickers, parsedSymbols }: {
    ticker: string[];
    parsedSymbols: {
        [ticker: string]: string[];
    };
}): [string, string];
