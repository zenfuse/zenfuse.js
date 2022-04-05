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
    '6h': null,
    '8h': null,
    '12h': null,
    '1d': '1day',
    '3d': null,
    '1w': '1week',
    '1M': '1mon',
};

const intervalsMap = new Map();

intervalsMap.set('1min', '1m');
intervalsMap.set('5min', '5m');
intervalsMap.set('15min', '15m');
intervalsMap.set('30min', '30m');
intervalsMap.set('60min', '1h');
intervalsMap.set('4hour', '1h');
intervalsMap.set('1day', '1d');
intervalsMap.set('1week', '1w');
intervalsMap.set('1mon', '1M');

module.exports = {
    timeIntervals,
    intervalsMap,
};
