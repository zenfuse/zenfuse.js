/**
 * This is list of clean functions for Binance data form an API 
 */



/**
 * @param {array} symbols List of symbols from binance endpoint  
 * @returns {array} Symbols only with spot type 
 */
const getOnlySpotMarkets = (symbols) => {
    return symbols.filter((market) => market.permissions.includes('SPOT'));
}

const structualizeMarkets = (markets) => {
    return markets.map((market) => {
        return {
            symbol: market.symbol,
            baseTicker: market.baseAsset,
            quoteTicker: market.quoteAsset,
        };
    });
}


module.exports = {
    getOnlySpotMarkets,
    structualizeMarkets
}