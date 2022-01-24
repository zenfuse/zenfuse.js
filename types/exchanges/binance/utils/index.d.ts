declare const _exports: {
    createHmacSignature: (data: any, key: any) => string;
    parseBinanceSymbol: (bSymbol: string, { tickers, parsedSymbols }: {
        ticker: string[];
        parsedSymbols: {
            [ticker: string]: string[];
        };
        tickers: any;
    }) => [string, string];
    validateOrderForCanceling: (order: {
        id: string | number;
    }) => void;
    transformMarketString: (libString: string) => string;
    assignDefaultsInOrder: (order: any, defaults: {
        limit: any;
        market: any;
    }) => any;
    transfromZenfuseOrder: (zOrder: import("../../..").Order) => {
        symbol: string;
        type: string;
        side: string;
        price: string;
        quantity: string;
        timeInForce: any;
    };
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
    structualizeMarkets: (markets: any[]) => {
        symbol: string;
        baseTicker: string;
        quoteTicker: string;
    };
    linkOriginalPayload: (object: any, originalPayload: any) => void;
};
export = _exports;
