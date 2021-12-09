declare module 'zenfuse' {
    /**
     * Candlestick data
     */
    export type kline = {
        open: number;
        hight: number;
        low: number;
        close: number;
        timestamp: number;
        interval: timeInterval;
        isClosed: boolean;
        symbol: string;
    };

    /**
     * m -> minutes; h -> hours; d -> days; w -> weeks; M -> months
     */
    export enum timeInterval {
        '1m',
        '3m',
        '5m',
        '15m',
        '30m',
        '1h',
        '2h',
        '4h',
        '6h',
        '8h',
        '12h',
        '1d',
        '3d',
        '1w',
        '1M',
    }
}
