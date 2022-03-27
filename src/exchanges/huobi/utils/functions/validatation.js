/**
 * Validation function for {@link BinanceSpot.cancelOrder}
 *
 * @param {object} order order object to cancel
 * @param {string | number} order.id Id is required
 */
const validateOrderForCanceling = (order) => {
    if (order.id === undefined) {
        throw new Error('order id is required for canceling');
    }

    const orderIdType = typeof order.id;

    if (orderIdType !== 'string' && orderIdType !== 'number') {
        throw new TypeError(
            `Order id for canceling should be string or number, recieved ${orderIdType}`,
        );
    }
};

module.exports = {
    validateOrderForCanceling,
};
