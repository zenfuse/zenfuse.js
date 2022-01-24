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
    orderSchema: import("zod").ZodEffects<import("zod").ZodEffects<import("zod").ZodObject<{
        symbol: import("zod").ZodString;
        quantity: import("zod").ZodNumber;
        price: import("zod").ZodOptional<import("zod").ZodNumber>;
        type: import("zod").ZodNativeEnum<{
            market: string;
            limit: string;
        }>;
        side: import("zod").ZodNativeEnum<{
            buy: string;
            sell: string;
        }>;
    }, "passthrough", import("zod").ZodTypeAny, {
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
