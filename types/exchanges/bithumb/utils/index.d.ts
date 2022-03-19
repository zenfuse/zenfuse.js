declare const _exports: {
    createHmacSignature: (sigParams: {
        apiKey: string;
        ts: number;
        body?: any;
    }, privateKey: string) => string;
    transformZenfuseOrder: (zOrder: Order) => {
        symbol: any;
        type: any;
        side: any;
        quantity: any;
        timestamp: string;
    };
    transformBithumbOrder: (bOrder: any, zInitialOrder?: any) => Order;
    transformBithumbOrderWS: (bOrder: any) => Order;
    extractSpotMarkets: (markets: any[]) => any[];
    extractTickersFromMarkets: (markets: any[]) => any[];
    extractSpotTickers: (payload: any) => any;
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    timeIntervalToSeconds: (interval: any) => any;
};
export = _exports;
