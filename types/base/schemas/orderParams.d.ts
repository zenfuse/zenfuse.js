export = ZenfuseOrderParams;
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
import { z } from "zod";
