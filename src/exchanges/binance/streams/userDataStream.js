const BinanceWebsocketBase = require('./websocketBase');

class UserDataStream extends BinanceWebsocketBase {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super(baseInstance);
    }
}

module.exports = UserDataStream;
