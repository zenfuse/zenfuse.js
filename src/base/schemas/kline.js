const { z } = require('zod');

/**
 * @typedef ZenfuseKline
 * @property {number} open
 * @property {number} hight
 * @property {number} low
 * @property {number} close
 * @property {string} timestamp
 * @property {string} interval
 * @property {boolean} [isClosed] Exists only from stream
 * @property {string} symbol
 * @property {number} volume
 */

const ZenfuseKline = z.object({
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    timestamp: z.number(),
    interval: z.enum([
        '1m',
        '3m',
        '5m',
        '15m',
        '30m',
        '1h',
        '2h',
        '4h',
        '6h',
        '8h',
        '12h',
        '1d',
        '3d',
        '1w',
        '1M',
    ]),
    isClosed: z.boolean().optional(),
    closeAt: z.number().optional(),
    symbol: z.string().refine((s) => s.split('/').length === 2),
    volume: z.number(),
});

module.exports = ZenfuseKline;
