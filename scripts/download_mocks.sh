#!/bin/bash

function fetch {
wget $1 \
    --quiet \
    --show-progress \
    --no-cache \
    --no-cookies \
    --output-document $2;
}

echo '⬇ Downloading static mocks...'
echo
echo 'Binance -------'
binancePath=tests/exchanges/binance/mocks/static
echo
fetch https://api.binance.com/api/v3/exchangeInfo ${binancePath}/exchangeInfo.json;
fetch https://api.binance.com/api/v3/ticker/price ${binancePath}/prices.json;
echo
echo
echo 'FTX -----------'
ftxPath=tests/exchanges/ftx/mocks/static
echo
fetch https://ftx.com/api/markets ${ftxPath}/markets.json;
echo
echo
