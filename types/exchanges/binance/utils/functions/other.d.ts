export function createHmacSignature(data: any, key: any): string;
/**
 * Parse binance symbol from `BTCETH` and returns base an quote ticker from it
 *
 * @param {string} bSymbol Ticker pair from binance like `ETHBUSD`
 * @param {BinanceCache} binanceCache Binance cache object
 * @returns {[string, string]} Base and quote ticker
 */
export function parseBinanceSymbol(bSymbol: string, { tickers, parsedSymbols }: BinanceCache): [string, string];
import BinanceCache = require("../../etc/cache");
