/**
 * Create HMAC signature specific for FTX
 *
 * @param {object} params
 * @param {number} params.ts UNIX Timestapm
 * @param {string} params.method HTTP Method
 * @param {string} params.path URL request path
 * @param {object} [params.body] Request body
 * @param {string} key HMAC Key
 * @returns {string} Hex HMAC Signature
 */
export function createHmacSignature({ ts, method, path, body }: {
    ts: number;
    method: string;
    path: string;
    body?: object;
}, key: string): string;
