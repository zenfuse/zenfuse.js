const FakeSocket = require('mock-socket').WebSocket;
const EventEmitter = require('events');

class MockedSocket extends EventEmitter {
    terminate() {
        delete this.ws;
    }

    constructor(url) {
        super();
        this.ws = new FakeSocket(url);

        this.ws.onmessage = (event) => {
            this.emit('message', event);
        };

        this.ws.onopen = () => {
            this.emit('open');
        };
    }

    send() {
        this.ws.send(...arguments);
    }

    close() {
        return this.ws.close();
    }

    addEventListener() {
        this.addListener(...arguments);
    }

    get readyState() {
        return this.ws.readyState;
    }
}

module.exports = { WebSocket: MockedSocket };
