export type Order = {
    id: string;
    timestamp: number;
    status: 'open' | 'closed' | 'canceled';
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    /**
     * Required for limit orders
     */
    price?: number | string;
    quantity: number | string;
};
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
export declare namespace exchanges {
    export { Binance as binance };
    export { FTX as ftx };
}
export { Binance, FTX };
