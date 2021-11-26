const BinanceWebsocketBase = require('./websocketBase');

describe('BinaceWebsocketBase', () => {
    let websocketBase;

    beforeAll(() => {
        websocketBase = new BinanceWebsocketBase();
    });

    it('should connect server', () => {
        expect(websocketBase);
    });
});
