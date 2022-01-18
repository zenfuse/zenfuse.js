declare const _exports: {
    createHmacSignature: ({ ts, method, path, body }: {
        ts: number;
        method: string;
        path: string;
        body?: any;
    }, key: string) => string;
    transfromZenfuseOrder: (zOrder: Order) => {
        market: any;
        type: any;
        side: any;
        size: any;
    };
    transfromFtxOrder: (fOrder: any) => Order;
    extractSpotMarkets: (markets: any[]) => any[];
    extractTickersFromMarkets: (markets: any[]) => any[];
    linkOriginalPayload: (object: any, originalPayload: any) => void;
};
export = _exports;
