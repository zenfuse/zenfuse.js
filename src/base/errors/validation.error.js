const UserError = require('./user.error');

class ZenfuseValidationError extends UserError {
    constructor(name, zodError) {
        super('VALIDATION_FAILED');
        this.name = name;
        this.zodError = zodError;

        this.message = zodError.errors
            .map((e) => `${e.path.join('.')} ${e.message}`.trim())
            .join('\n');
    }
}

module.exports = ZenfuseValidationError;
