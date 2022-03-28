/**
 * @enum {import('../..').timeInterval}
 */
const timeIntervals = {
    '1m': '1min',
    '3m': null,
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1h': '60min',
    '2h': null,
    '4h': '4hour',
    '6h': '6h',
    '8h': null,
    '12h': null,
    '1d': '1day',
    '3d': null,
    '1w': '1week',
    '1M': '1mon',
};

module.exports = {
    timeIntervals,
};
