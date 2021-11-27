echo '\n\nBinance -------';
curl https://api.binance.com/api/v3/exchangeInfo > ./tests/binance/mocks/static/exchangeInfo.json;
echo '\n\nFTX -----------';
curl https://ftx.com/api/markets > ./tests/ftx/mocks/static/markets.json;
