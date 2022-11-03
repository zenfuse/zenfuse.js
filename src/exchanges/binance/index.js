const BinanceSpot = require('./wallets/spot');

// prettier-ignore
/**
 * @enum {BinanceSpot}
 */
const BinanceWallets = {
    'spot': BinanceSpot,
};

module.exports = BinanceWallets;
