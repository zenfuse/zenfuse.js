const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

const linkOriginalPayload = (object, originalPayload) => {
    Object.defineProperty(object, Symbol.for('zenfuse.originalPayload'), {
        value: originalPayload,
        enumerable: false,
        configurable: false,
        writable: false,
    });
};

module.exports = {
    createHmacSignature,
    linkOriginalPayload,
};
