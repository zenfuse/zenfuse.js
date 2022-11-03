declare const _exports: {
    createHmacSignature: ({ ts, method, path, body }: {
        ts: number;
        method: string;
        path: string;
        body?: any;
    }, key: string) => string;
    transformZenfuseOrder: (zOrder: import("../../../base/schemas/orderParams").ZenfuseOrderParams) => any;
    transformOkxOrder: (xOrder: any) => import("../../../base/schemas/openOrder").PlacedOrder;
    linkOriginalPayload: (object: any, originalPayload: any) => void;
    timeIntervalToSeconds: (interval: any) => any;
};
export = _exports;
