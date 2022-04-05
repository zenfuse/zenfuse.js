const { createHmac } = require('crypto');

/**
 * Create HMAC signature specific for Bithumb
 *
 * @param {object} sigParams
 * @param {string} sigParams.apiKey Public key
 * @param {number} sigParams.ts UNIX Timestamp
 * @param {object} [sigParams.body] Request body
 * @param {string} privateKey Private key
 * @returns {string} Hex HMAC Signature
 */
const createHmacSignature = (sigParams, privateKey) => {
    const charsToDel = ['{', '}', '"'];

    let signaturePayload = JSON.stringify(sigParams)
        .slice(1, -1)
        .split(',')
        .join('&')
        .split(':')
        .join('=');

    charsToDel.forEach((item) => {
        signaturePayload = signaturePayload.split(item).join('');
    });

    return createHmac('sha256', privateKey)
        .update(signaturePayload)
        .digest('hex');
};

module.exports = { createHmacSignature };
