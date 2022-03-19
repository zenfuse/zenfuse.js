const HuobiSpot = require('./wallets/spot');

// prettier-ignore
/**
 * @enum {HuobiWallets}
 */
const HuobiWallets = {
    'spot': HuobiSpot,
};

module.exports = HuobiWallets;
