---
sidebar_position: 1
---

# Introduction

Zenfuse.js is a crypto trading library connector for Node.js. For trading, analyze, visualize any manage any data from API easily on supported exchanges.

**Current exchanges:**<br/>
![Binance](/img/exchanges/badges/binance-badge.svg)
![FTX](/img/exchanges/badges/FTX-badge.svg)
![OKX](/img/exchanges/badges/OKX-badge.svg)
![Bitglobal](/img/exchanges/badges/Bitglobal-badge.svg)

:::note In Development

This library is in active state of development. New exchanges and features incoming. We really need your feedback to make this tool better.

Feel free to [**create any issue**](https://github.com/zenfuse/zenfuse.js/issues) or ask about everything in [**Github Discussions**](https://github.com/zenfuse/zenfuse.js/discussions).

:::

## The problem solution

Using many different crypto exchange API's is a drag. Different interfaces, namings, payload subscription, symbols separator and etc.
Zenfuse.js handles it, and provides clean, powerful solution for modern javascript environment.

**Key features:**

-   Fetching public data
-   Orders manipulating
-   Real-time events
    -   Current price
    -   Trades
    -   Account balance events

Unlike alternative solutions. This library is

## Getting Started

:::info Note

This library for server side JS. It doesn't work in the browsers.

:::

### Installation

You will need

Install `zenfuse` package from npm.

```
npm install zenfuse
```

After you can import it.

```js
// ESM
import zenfuse from 'zenfuse';

// CommonJS
const zenfuse = require('zenfuse');
```

:::note Recommendation

We strongly recommend see the sources for better understanding. The library isn't complicated its easy to learn and easy to master to.

:::

### A small showcase for the impatient

```js
import { FTX, Binance } from 'zenfuse';

const ftx = new FTX.spot();

// Fetch current BTC/USD price from FTX exchange
ftx.fetchPrice('BTC/USD').then((price) => {
    console.log('Current BTC/USD price:', price);
});

// Fetch all current listing coins from FTX
ftx.fetchTickers().then((tickers) => {
    console.log('All FTX tickers', tickers.join(', '));
});

const binance = new Binance.spot();

// Authenticate instance, so you can use private methods
binance.auth({
    publicKey: '***',
    privateKey: '***',
});

// Create connection instance for account events
const accountDataStream = binance.getAccountDataStream();

// Open websocket connection
await accountDataStream.open();

// Subscribe for order updates on account
accountDataStream.on('orderUpdate', (order) => {
    console.log('Order Update:', order);
});

// Sell 0.0004 ETH for 100 USDT, and we receive order update event above
binance.postOrder({
    symbol: 'ETH/USDT',
    type: 'limit',
    side: 'sell',
    price: 100,
    quantity: 0.0004,
});

// Create connection instance for market data
const marketDataStream = binance.getMarketDataStream();

// Open websocket connection
await marketDataStream.open();

// Subscribe for current BTC price
marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'BTC/USDT',
});

// After we will handle newPrice events
marketDataStream.on('newPrice', (event) => {
    console.log(`Current ${event.symbol} price`, '->', event.price);
});
```
