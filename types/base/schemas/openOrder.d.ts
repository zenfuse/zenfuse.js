export = ZenfuseOpenOrder;
declare const ZenfuseOpenOrder: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodNumber;
    status: z.ZodEnum<["open", "close", "canceled"]>;
    symbol: z.ZodEffects<z.ZodString, string, string>;
    type: z.ZodEnum<["market", "limit"]>;
    side: z.ZodEnum<["buy", "sell"]>;
    price: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    symbol?: string;
    type?: "market" | "limit";
    id?: string;
    status?: "open" | "canceled" | "close";
    timestamp?: number;
    side?: "buy" | "sell";
    price?: number;
    quantity?: number;
}, {
    symbol?: string;
    type?: "market" | "limit";
    id?: string;
    status?: "open" | "canceled" | "close";
    timestamp?: number;
    side?: "buy" | "sell";
    price?: number;
    quantity?: number;
}>;
import { z } from "zod";
