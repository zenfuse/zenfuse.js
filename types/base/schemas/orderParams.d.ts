export = ZenfuseOrderParams;
/**
 * @typedef {object} ZenfuseOrderParams
 * @property {string} symbol
 * @property {number|string} quantity
 * @property {number|string} [price] Required for limit orders
 * @property {'market'|'limit'} type
 * @property {number} timestamp
 * @property {'buy'|'sell'} side
 */
declare const ZenfuseOrderParams: z.ZodEffects<z.ZodObject<{
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
    quantity?: number;
    price?: number;
    type?: string;
    side?: string;
}, {
    symbol?: string;
    quantity?: number;
    price?: number;
    type?: string;
    side?: string;
}>, {
    symbol?: string;
    quantity?: number;
    price?: number;
    type?: string;
    side?: string;
}, {
    symbol?: string;
    quantity?: number;
    price?: number;
    type?: string;
    side?: string;
}>;
declare namespace ZenfuseOrderParams {
    export { ZenfuseOrderParams };
}
import { z } from "zod/lib";
type ZenfuseOrderParams = {
    symbol: string;
    quantity: number | string;
    /**
     * Required for limit orders
     */
    price?: number | string;
    type: 'market' | 'limit';
    timestamp: number;
    side: 'buy' | 'sell';
};
