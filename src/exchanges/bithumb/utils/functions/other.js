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
    // const signaturePayload = `apiKey=${apiKey}&msgNo=${msgNo}&timestamp=${ts}&version=V1.0.0`;

    const signaturePayload = JSON.stringify(sigParams)
        .replace(/\{|\}|\"/gi, '')
        .replace(/\,/gi, '&')
        .replace(/\:/gi, '=');

    // console.log(signaturePayload);

    return createHmac('sha256', privateKey)
        .update(signaturePayload)
        .digest('hex');
};

module.exports = { createHmacSignature };
