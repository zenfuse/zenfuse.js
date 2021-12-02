echo '\n\nBinance -------';
curl https://api.binance.com/api/v3/exchangeInfo > ./tests/binance/mocks/static/exchangeInfo.json;
curl https://api.binance.com/api/v3/ticker/price > ./tests/binance/mocks/static/prices.json;


echo '\n\nFTX -----------';
curl https://ftx.com/api/markets > ./tests/ftx/mocks/static/markets.json;
