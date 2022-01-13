const ZenfuseError = require('./base.error');

const ERROR_MSG =
    'Instance does not have keys for authentication. Use auth() first for private API usage';

class NotAuthenticatedError extends ZenfuseError {
    constructor() {
        super(ERROR_MSG);
        this.name = 'NotAuthenticatedError';
    }
}

module.exports = NotAuthenticatedError;
