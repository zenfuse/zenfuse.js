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

    const signaturePayload = JSON.stringify(sigParams).slice(1, -1)
        // .replace(/\{|\}|\"/gi, '')
        // .replaceAll(/\{|\}|\"/, '')
        .split(',').join('&')
        .split(':').join('=')

    charsToDel.forEach((item) => {
        signaturePayload.split(item).join('');
    });



    console.log(signaturePayload);

    return createHmac('sha256', privateKey)
        .update(signaturePayload)
        .digest('hex');
};

module.exports = { createHmacSignature };
