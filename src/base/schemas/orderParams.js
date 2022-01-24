const { z } = require('zod');

const ZenfuseOrderParams = z
    .object({
        symbol: z.string(),
        quantity: z.number(),
        price: z.number().optional(),
        type: z.nativeEnum({
            market: 'market',
            limit: 'limit',
        }),
        side: z.nativeEnum({
            buy: 'buy',
            sell: 'sell',
        }),
    })
    .passthrough()
    .refine(
        (order) => {
            if (order.type === 'limit') {
                return order.price;
            }

            return true;
        },
        {
            message: 'Price is required for limit order',
        },
    );

module.exports = ZenfuseOrderParams;
