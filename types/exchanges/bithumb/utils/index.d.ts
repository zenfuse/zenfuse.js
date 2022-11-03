declare const _exports: {
    createHmacSignature: (sigParams: {
        apiKey: string;
        ts: number;
        body?: any;
    }, privateKey: string) => string;
    transformZenfuseOrder: (zOrder: import("../../../base/schemas/orderParams").ZenfuseOrderParams) => any;
    transformBithumbOrder: (bOrder: any, zInitialOrder?: any) => import("../../../base/schemas/openOrder").PlacedOrder;
    transformBithumbOrderWS: (bOrder: any) => import("../../../base/schemas/openOrder").PlacedOrder;
    extractSpotMarkets: (markets: any[]) => any[];
    extractTickersFromMarkets: (markets: any[]) => any[];
    extractSpotTickers: (payload: any) => any;
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    timeIntervalToSeconds: (interval: any) => any;
};
export = _exports;
