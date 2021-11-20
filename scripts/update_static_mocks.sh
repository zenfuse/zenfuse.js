echo '\n\nBinance -------';
curl https://api.binance.com/api/v3/exchangeInfo > ./tests/binance/mocks/exchangeInfo.json;
echo '\n\nFTX -----------';
curl https://ftx.com/api/markets > ./tests/ftx/mocks/markets.json;
