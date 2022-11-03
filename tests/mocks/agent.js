const https = require('https');

class MockedAgent extends https.Agent {
    constructor() {
        super();
        jest.spyOn(this, 'createConnection');
    }

    createConnection(port, options, callback) {
        return https.Agent.prototype.createConnection.call(
            this,
            port,
            options,
            callback,
        );
    }
}

module.exports = MockedAgent;
