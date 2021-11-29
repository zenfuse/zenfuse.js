const BinanceSpot = require('./wallets/spot');

module.exports = class Binance {
    /**
     * @param {string} wallet
     * @param {import('../../base/exchange').BaseOptions} options
     */
    constructor(wallet, options) {
        if (wallet === 'spot') {
            return new BinanceSpot(options);
        }

        throw new ReferenceError(
            `${wallet} wallet did not exits on this Binance class`,
        );
    }
};
