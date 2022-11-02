declare const _exports: {
    createHmacSignature: ({ ts, method, path, body }: {
        ts: number;
        method: string;
        path: string;
        body?: any;
    }, key: string) => string;
    transfromZenfuseOrder: (zOrder: import("../../../base/schemas/orderParams").ZenfuseOrderParams) => any;
    transfromFtxOrder: (fOrder: any) => import("../../../base/schemas/openOrder").PlacedOrder;
    extractSpotMarkets: (markets: any[]) => any[];
    extractTickersFromMarkets: (markets: any[]) => any[];
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    timeIntervalToSeconds: (interval: any) => any;
};
export = _exports;
