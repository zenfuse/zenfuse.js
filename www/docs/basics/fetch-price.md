---
slug: /get-current-price
description: How to get current price
---

# Get current price

## Fetch current price only once

For http fetching use `.fetchPrice` method.

### For all markets

If no parameter provided. Method will get current price from all awailable markets.

```js
const priceList = await binance.fetchPrice();

// Console output
priceList.forEach({ symbol, price } => {
    console.log(symbol, '->', price)
})
```
Expected output:
```
BTC/USDT -> 99999.99
ETH/DAI -> 1337.99
...
```
### For specific market

To fetch specific market price, include first parameter as market symbol fith `/` separator.

```js
const price = await binance.fetchPrice('BTC/USDT');

// Console output
console.log('Current Bitcoin price is', price)
```
Expected output:
```
Current Bitcoin price 99999.99
```

## Current price stream

To get current price in real time you need `marketDataStream` instance.

### Create `marketDataCreate` instance

```js
import { FTX } from 'zenfuse';

// Create exchange instance
const ftx = FTX.spot();

// Create stream instance
const marketDataStream = ftx.getMarketDataStream();
```

### Get price stream for specific market

```js

// Open websocket connection
marketDataStream.open()

// Subscribe for current BTC price
marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'ETH/USD', // ftx market symbol
});

// After we will handle newPrice events
marketDataStream.on('newPrice', (event) => {
    console.log(`Current ${event.symbol} price`, '->', event.price);
});
```

Expected output:
```
Current ETH/USD price 1337.69
Current ETH/USD price 1388.88
Current ETH/USD price 1366.66
...
```

### Get price stream for more markets

While websocket stream opened, you can use `.subscribeTo` method as much as you can.

```js
// Bitcoin
marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'BTC/USD',
});

// Ethereum
marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'ETH/USD',
});

// FTX token (this stream from ftx exhcnage)
marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'FTT/USD',
});

// After we will handle newPrice events
marketDataStream.on('newPrice', (event) => {
    console.log(`Current ${event.symbol} price`, '->', event.price);
});
```
Expected output:
```
Current ETH/USD price 1337.69
Current BTC/USD price 99999.99
Current FTT/USD price 0.00
Current BTC/USD price 99999.98
Current ETH/USD price 1330.48
...
```

