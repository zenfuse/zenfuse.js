const ZenfuseBaseError = require('./base.error');

class ZenfuseValidationError extends ZenfuseBaseError {
    constructor(name, zodError) {
        super();
        this.name = name;
        this.zodError = zodError;

        this.message = zodError.errors
            .map((e) => `${e.path.join('.')} ${e.message}`.trim())
            .join('\n');
    }
}

module.exports = ZenfuseValidationError;
