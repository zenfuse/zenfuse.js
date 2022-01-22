const ZenfuseBaseError = require('./base.error');

const ERROR_MSG =
    'Instance does not have keys for authentication. Use auth() first for private API usage';

class NotAuthenticatedError extends ZenfuseBaseError {
    constructor() {
        super(ERROR_MSG);
        this.name = 'NotAuthenticatedError';
    }
}

module.exports = NotAuthenticatedError;
