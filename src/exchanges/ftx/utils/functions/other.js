const { createHmac } = require('crypto');

/**
 * Create HMAC sicnature specific for FTX
 *
 * @param {object} params
 * @param {number} params.ts UNIX Timestapm
 * @param {string} params.method HTTP Method
 * @param {string} params.path URL request path
 * @param {object} [params.body] Request body
 * @param {string} key HMAC Key
 * @returns {stting} Hex HMAC Signature
 */
const createHmacSignature = (params, key) => {
    const signaturePayload = Object.values(params).join('');

    return createHmac('sha256', key).update(signaturePayload).digest('hex');
};

module.exports = { createHmacSignature };
