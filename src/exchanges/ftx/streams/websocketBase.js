const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class ExchangeWebsocketBase extends EventEmitter {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;
    }

    getSocketConnection(path) {
        const { wsClientOptions } = this.base.options;

        const url = new URL(path, wsClientOptions.prefixUrl);

        const socket = new WebSocket(url, wsClientOptions);

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

module.exports = ExchangeWebsocketBase;