declare const _exports: {
    createHmacSignature: (data: any, key: any) => string;
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    validateOrderForCanceling: (order: {
        id: string | number;
    }) => void;
    transformMarketString: (libString: string) => string;
    assignDefaultsInOrder: (order: any, defaults: {
        limit: any;
        market: any;
    }) => any;
    transformOrderValues: (order: any) => {
        type: any;
        side: any;
        price: any;
        quantity: any;
        timeInForce: any;
        symbol: string;
    };
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
    }) => import("../../..").kline;
    getAllTickersFromSymbols: (symbols: any[]) => string[];
    getOnlySpotMarkets: (symbols: any[]) => any[];
    structualizeMarkets: (markets: any[]) => {
        symbol: string;
        baseTicker: string;
        quoteTicker: string;
    };
};
export = _exports;
