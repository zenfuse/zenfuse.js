class BaseConnectorError extends Error {
    constructor(msg) {
        super(msg);
    }
}

module.exports = BaseConnectorError;
