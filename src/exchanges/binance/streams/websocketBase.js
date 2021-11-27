const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class BinanceWebsocketBase extends EventEmitter {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;
    }

    getSocketConnection(path) {
        const url = new URL(path, this.base.options.websocketUrl);

        const socket = new WebSocket(url);

        return new Promise((resolve, reject) => {
            socket.once('error', (err) => reject(err));

            socket.once('open', () => {
                socket.removeAllListeners('error');
                socket.on('error', this.handleConnectionError.bind(this));
                resolve(socket);
            });
        });
    }

    handleConnectionError(err) {
        throw err; // TODO: Websocket connection error
    }
}

module.exports = BinanceWebsocketBase;
