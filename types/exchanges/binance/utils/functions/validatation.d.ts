/**
 * Validation function for {@link BinanceSpot.cancelOrder}
 *
 * @param {object} order order object to cancel
 * @param {string | number} order.id Id is required
 */
export function validateOrderForCanceling(order: {
    id: string | number;
}): void;
