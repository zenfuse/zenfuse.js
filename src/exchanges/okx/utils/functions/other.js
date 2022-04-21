const { createHmac } = require('crypto');

/**
 * Create HMAC signature specific for OKX
 *
 * @param {object} params
 * @param {number} params.ts ISO Date
 * @param {string} params.method HTTP Method
 * @param {string} params.path URL request path
 * @param {object} [params.body] Request body
 * @param {string} key HMAC Key
 * @returns {string} Hex HMAC Signature
 */
const createHmacSignature = ({ ts, method, path, body = '' }, key) => {
    if (body) body = JSON.stringify(body);

    const signaturePayload = [ts, method, path, body].join('');

    return createHmac('sha256', key).update(signaturePayload).digest('base64');
};

const propsAsString = (obj) => {
    return Object.keys(obj)
        .map((k) => {
            return k + '=' + obj[k];
        })
        .join('&');
};

module.exports = { createHmacSignature, propsAsString };
