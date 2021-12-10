const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

const linkOriginalPayload = (object, originalPayload) => {
    object[Symbol.for('zenfuse.originalPayload')] = originalPayload;
};

module.exports = {
    createHmacSignature,
    linkOriginalPayload,
};
