const { createHmac } = require('crypto');

/**
 * Create HMAC signature specific for Bithumb
 *
 * @param {object} params
 * @param {string} params.apiKey Public key
 * @param {string} privateKey Private key
 * @param {number} params.ts UNIX Timestamp
 * @param {string} msgNo Message number
 * @param {object} [params.body] Request body
 * @returns {string} Hex HMAC Signature
 */
const createHmacSignature = ({ apiKey, ts, msgNo }, privateKey) => {

    const signaturePayload = `apiKey=${apiKey}&msgNo=${msgNo}&timestamp=${ts}`;

    return createHmac('sha256', privateKey).update(signaturePayload).digest('hex');
};

module.exports = { createHmacSignature };
