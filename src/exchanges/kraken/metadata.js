/**
 * @enum {import('../..').timeInterval}
 */
const timeIntervals = {
    '1m': '1',
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1h': '60',
    '2h': null,
    '4h': '240',
    '6h': null,
    '8h': null,
    '12h': null,
    '1d': '1440',
    '3d': null,
    '1w': '10080',
    '1M': null,
};

module.exports = {
    timeIntervals,
};
