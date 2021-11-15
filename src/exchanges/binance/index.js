const BinanceSpot = require('./wallets/spot');

module.exports = class Binance {
    constructor(wallet, httpClientOptions) {
        if (wallet === 'spot') {
            return new BinanceSpot(httpClientOptions);
        }
    }
};
