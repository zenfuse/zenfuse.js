const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

const linkOriginalResponse = (object, originalResponse) => {
    object[Symbol.for('zenfuse.originalResponce')] = originalResponse;
};

module.exports = {
    createHmacSignature,
    linkOriginalResponse,
};
