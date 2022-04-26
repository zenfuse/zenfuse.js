export type exports = any;
export type Trade = {
    /**
     * Exchange trade id
     */
    id: string;
    /**
     * Time when trade executed
     */
    timestamp: number;
    /**
     * Amount of base currency
     */
    amount: number;
    price: number;
};
export type Kline = {
    open: number;
    hight: number;
    close: number;
    timestamp: number;
    interval: timeInterval;
    isClosed: boolean;
    symbol: string;
};
/**
 * m -> minutes; h -> hours; d -> days; w -> weeks; M -> months
 */
export type timeInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
import Binance = require("./exchanges/binance");
import FTX = require("./exchanges/ftx");
import Bithumb = require("./exchanges/bithumb");
import OKX = require("./exchanges/okx");
export declare const errorCodes: {
    INVALID_CREDENTIALS: symbol;
    INSUFFICIENT_FUNDS: symbol; /**
     * @enum
     */
    INVALID_ORDER: symbol;
    UNKNOWN_EXCEPTION: symbol;
};
export declare const config: {
    get(key: any): any;
    set(key: any, value: any): any;
    delete(key: any): any;
    has(key: any): any;
};
export { Binance, FTX, Bithumb, Bithumb as Bitglobal, OKX };
