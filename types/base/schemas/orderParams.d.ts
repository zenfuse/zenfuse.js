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
    side?: string;
    price?: number;
    quantity?: number;
}, {
    symbol?: string;
    type?: string;
    side?: string;
    price?: number;
    quantity?: number;
}>, {
    symbol?: string;
    type?: string;
    side?: string;
    price?: number;
    quantity?: number;
}, {
    symbol?: string;
    type?: string;
    side?: string;
    price?: number;
    quantity?: number;
}>;
import { z } from "zod";
