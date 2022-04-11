declare const _exports: {
    createHmacSignature: (data: any, key: any) => string;
    parseBinanceSymbol: (bSymbol: string, { tickers, parsedSymbols }: import("../etc/cache")) => [string, string];
    validateOrderForCanceling: (order: {
        id: string | number;
    }) => void;
    transformMarketString: (libString: string) => string;
    assignDefaultsInOrder: (order: import("../../..").Order, defaults: {
        limit: import("../../..").Order;
        market: import("../../..").Order;
    }) => import("../../..").Order;
    transfromZenfuseOrder: (zOrder: import("../../..").Order) => any;
    transfromBinanceOrder: (bOrder: any) => import("../../..").Order;
    transfornCandlestick: (k: {
        t: number;
        T: number;
        s: string;
        i: string;
        f: number;
        L: number;
        o: string;
        c: string;
        h: string;
        l: string;
        v: string;
        n: number;
        x: boolean;
        q: string;
        V: string;
        Q: string;
        B: string;
    }) => import("../../..").Kline;
    extractTickersFromSymbols: (symbols: any[]) => string[];
    extractSpotMarkets: (symbols: any[]) => any[];
    structualizeMarkets: (markets: any[]) => import("./functions/agregation").structualizedMarket;
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    timeIntervalToSeconds: (interval: any) => any;
};
export = _exports;
