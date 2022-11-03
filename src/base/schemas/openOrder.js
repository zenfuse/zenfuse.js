const { z } = require('zod');

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

const ZenfusePlacedOrder = z.object({
    id: z.string(),
    timestamp: z.number(),
    status: z.enum(['open', 'closed', 'canceled']),
    symbol: z.string().refine((s) => s.split('/').length === 2),
    type: z.enum(['market', 'limit']),
    side: z.enum(['buy', 'sell']),
    price: z.number().optional(),
    quantity: z.number(),
});

module.exports = ZenfusePlacedOrder;
