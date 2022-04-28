const { createHmac } = require('crypto');

const linkOriginalPayload = (object, originalPayload) => {
    Object.defineProperty(object, Symbol.for('zenfuse.originalPayload'), {
        value: originalPayload,
        enumerable: false,
        configurable: true,
        writable: false,
    });
};

const timeIntervalToSeconds = (interval) => {
    const INTERVAL_TABLE = {
        '1m': 60,
        '3m': 180,
        '5m': 300,
        '15m': 900,
        '30m': 1800,
        '1h': 3600,
        '2h': 7200,
        '4h': 14400,
        '6h': 21600,
        '8h': 28800,
        '12h': 43200,
        '1d': 86400,
        '3d': 259200,
        '1w': 604800,
        '1M': 86400 * 30,
    };

    const seconds = INTERVAL_TABLE[interval];

    if (!seconds) {
        throw new TypeError(`Uknown interval "${interval}"`);
    }

    return seconds;
};

const createHmacSignatureDefault = ({ ts, method, path, body = '' }, key, encoding) => {
    if (body) body = JSON.stringify(body);

    const signaturePayload = [ts, method, path, body].join('');

    return createHmac('sha256', key).update(signaturePayload).digest(encoding);
};

const createHmacSignatureBithumb = (sigParams, privateKey, encoding) => {
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
        .digest(encoding);
};

module.exports = {
    linkOriginalPayload,
    timeIntervalToSeconds,
    createHmacSignatureDefault,
    createHmacSignatureBithumb,
};
