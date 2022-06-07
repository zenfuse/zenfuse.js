export = ZenfusePlacedOrder;
/**
 * @typedef {object} PlacedOrder
 * @property {string} id
 * @property {number} timestamp
 * @property {'open'|'closed'|'canceled'} status
 * @property {string} symbol
 * @property {'market'|'limit'} type
 * @property {'buy'|'sell'} side
 * @property {number|string} [price] Required for limit orders
 * @property {number|string} quantity
 */
declare const ZenfusePlacedOrder: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodNumber;
    status: z.ZodEnum<["open", "closed", "canceled"]>;
    symbol: z.ZodEffects<z.ZodString, string, string>;
    type: z.ZodEnum<["market", "limit"]>;
    side: z.ZodEnum<["buy", "sell"]>;
    price: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    symbol?: string;
    type?: "market" | "limit";
    id?: string;
    status?: "closed" | "open" | "canceled";
    quantity?: number;
    price?: number;
    side?: "buy" | "sell";
    timestamp?: number;
}, {
    symbol?: string;
    type?: "market" | "limit";
    id?: string;
    status?: "closed" | "open" | "canceled";
    quantity?: number;
    price?: number;
    side?: "buy" | "sell";
    timestamp?: number;
}>;
declare namespace ZenfusePlacedOrder {
    export { PlacedOrder };
}
import { z } from "zod/lib";
type PlacedOrder = {
    id: string;
    timestamp: number;
    status: 'open' | 'closed' | 'canceled';
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    /**
     * Required for limit orders
     */
    price?: number | string;
    quantity: number | string;
};
