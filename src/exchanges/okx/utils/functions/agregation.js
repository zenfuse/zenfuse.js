/**
 * @param {object[]} payload Markets from OKX `/api/v5/public/instruments` endpoint
 * @returns {object[]}
 */
const extractSpotTickers = (payload) => {
    const markets = payload.map((ticker) => ticker.instId);

    return markets;
};

module.exports = {
    extractSpotTickers,
};
