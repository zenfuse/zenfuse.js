/**
 * @param {object[]} markets Markets from FTX `/api/markets` endpoint
 * @returns {object[]}
 */
const extractSpotMarkets = (markets) => {
    return markets.filter((market) => market.type === 'spot');
};

/**
 * @param {object[]} markets Markets from FTX `/api/markets` endpoint
 * @returns {object[]}
 */
const extractTickersFromMarkets = (markets) => {
    const tickers = markets
        .map((market) => {
            return [market.baseCurrency, market.quoteCurrency];
        })
        .flat()
        .filter(Boolean);

    return tickers;
};

const extractSpotTickers = (payload) => {
    const tickers = payload.map((ticker) => ticker.s);

    return tickers;
};

module.exports = {
    extractSpotMarkets,
    extractTickersFromMarkets,
    extractSpotTickers,
};
