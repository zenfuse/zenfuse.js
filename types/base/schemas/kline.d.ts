export = ZenfuseKline;
/**
 * @typedef ZenfuseKline
 * @property {number} open
 * @property {number} hight
 * @property {number} low
 * @property {number} close
 * @property {timeIntervals} timestamp
 * @property {string} interval
 * @property {boolean} [isClosed] Exists only from stream
 * @property {string} symbol
 * @property {number} volume
 */
declare const ZenfuseKline: z.ZodObject<{
    open: z.ZodNumber;
    high: z.ZodNumber;
    low: z.ZodNumber;
    close: z.ZodNumber;
    timestamp: z.ZodNumber;
    interval: z.ZodEnum<["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]>;
    isClosed: z.ZodOptional<z.ZodBoolean>;
    closeAt: z.ZodOptional<z.ZodNumber>;
    symbol: z.ZodEffects<z.ZodString, string, string>;
    volume: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    timestamp?: number;
    interval?: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
    isClosed?: boolean;
    closeAt?: number;
    symbol?: string;
    volume?: number;
}, {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    timestamp?: number;
    interval?: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
    isClosed?: boolean;
    closeAt?: number;
    symbol?: string;
    volume?: number;
}>;
declare namespace ZenfuseKline {
    export { ZenfuseKline };
}
import { z } from "zod/lib";
type ZenfuseKline = {
    open: number;
    hight: number;
    low: number;
    close: number;
    timestamp: timeIntervals;
    interval: string;
    /**
     * Exists only from stream
     */
    isClosed?: boolean;
    symbol: string;
    volume: number;
};
import { timeIntervals } from "../../exchanges/ftx/metadata";
