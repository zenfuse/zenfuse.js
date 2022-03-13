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
    type?: "limit" | "market";
    id?: string;
    status?: "open" | "canceled" | "close";
    side?: "buy" | "sell";
    price?: number;
    quantity?: number;
    timestamp?: number;
}, {
    symbol?: string;
    type?: "limit" | "market";
    id?: string;
    status?: "open" | "canceled" | "close";
    side?: "buy" | "sell";
    price?: number;
    quantity?: number;
    timestamp?: number;
}>;
import { z } from "zod";
