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
echo
fetch https://api.binance.com/api/v3/exchangeInfo ./tests/binance/mocks/static/exchangeInfo.json;
fetch https://api.binance.com/api/v3/ticker/price ./tests/binance/mocks/static/prices.json;
echo
echo
echo 'FTX -----------'
echo
fetch https://ftx.com/api/markets ./tests/ftx/mocks/static/markets.json;
echo
echo