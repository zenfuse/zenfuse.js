/**
 * @enum {import('../..').timeInterval}
 */
 const timeIntervals = {
    '1m': '1min',
    '3m': '3min',
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1h': '1hour',
    '2h': '2hour',
    '4h': '4hour',
    '6h': '6hour',
    '8h': null,
    '12h': '12hour',
    '1d': 'day',
    '3d': null,
    '1w': 'week',
    '1M': null,
};

module.exports = {
    timeIntervals,
};
