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

module.exports = {
    linkOriginalPayload,
    timeIntervalToSeconds,
};
