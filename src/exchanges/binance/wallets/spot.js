const BinanceBase = require('../base');

/**
 *
 */
class BinanceSpot extends BinanceBase {
    constructor(httpClientOptions) {
        super(httpClientOptions);
    }

    /**
     * Create order on Binance
     * @param {} orderParams
     */
    createOrder(orderParams) {
        this.fetch('');
    }
}

module.exports = BinanceSpot;
