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
export function createHmacSignature(sigParams: {
    apiKey: string;
    ts: number;
    body?: object;
}, privateKey: string): string;
