const { z } = require('zod');

const ZenfuseOpenOrder = z.object({
    id: z.string(),
    timestamp: z.number(),
    status: z.enum(['open', 'close', 'canceled']),
    symbol: z.string().refine((s) => s.split('/').length === 2),
    type: z.enum(['market', 'limit']),
    side: z.enum(['buy', 'sell']),
    price: z.number().optional(),
    quantity: z.number(),
});

module.exports = ZenfuseOpenOrder;
