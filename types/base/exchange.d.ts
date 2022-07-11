export = ExchangeBase;
declare class ExchangeBase {
    /**
     * @type {BaseOptions}
     */
    static DEFAULT_OPTIONS: BaseOptions;
    /**
     * @param {BaseOptions} options
     */
    constructor(options?: BaseOptions);
    options: {
        /**
         * This object will be passed to `got.extend`
         */
        httpClientOptions: got.ExtendOptions;
        /**
         * Websocket client options based on `ws` lib with some extra parameters
         */
        wsClientOptions: ExtraWsOptions & import("ws").ClientOptions;
    };
    fetcher: any;
    orderSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
        symbol: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodOptional<z.ZodNumber>;
        type: z.ZodNativeEnum<{
            market: string;
            limit: string;
        }>;
        side: z.ZodNativeEnum<{
            buy: string;
            sell: string;
        }>;
    }, "passthrough", z.ZodTypeAny, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }>, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }>, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }, {
        symbol?: string;
        type?: string;
        quantity?: number;
        price?: number;
        side?: string;
    }>;
    validateOrderParams(order: any): void;
    validateCandleHistoryParams(params: any): void;
    /**
     * @typedef {import('./schemas/orderParams').ZenfuseOrderParams} ZenfuseOrderParams
     */
    /**
     * Preciser for basic order values. Exists for provide same precisions for any exchanges without context.
     *
     * @protected
     * @param {ZenfuseOrderParams} zOrder
     * @param {object} limits Decimal precisions
     * @param {number} limits.price
     * @param {number} limits.quantity
     * @returns {ZenfuseOrderParams} Order parameters with precised price and quantity
     */
    protected preciseOrderValues(zOrder: OrderParamsSchema.ZenfuseOrderParams, limits: {
        price: number;
        quantity: number;
    }): OrderParamsSchema.ZenfuseOrderParams;
}
declare namespace ExchangeBase {
    export { ExtraWsOptions, BaseOptions };
}
import got = require("got");
type ExtraWsOptions = {
    /**
     * When specified, `prefixUrl` will be
     * prepended to websocket `url`.
     * **Note:** Path will be overwritten
     */
    prefixUrl: string;
};
import z = require("zod");
import OrderParamsSchema = require("./schemas/orderParams");
type BaseOptions = {
    /**
     * This object will be passed to `got.extend`
     */
    httpClientOptions: import('got').ExtendOptions;
    /**
     * Websocket client options based on `ws` lib with some extra parameters
     */
    wsClientOptions: ExtraWsOptions & import('ws').ClientOptions;
};
