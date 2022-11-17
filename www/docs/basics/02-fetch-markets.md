---
description: How to get list of available markets and tickers
slug: /get-markets
---

# Get markets

This is a BitGlobal example, but it can be any exchange class.

## Fetch all spot markets exchange

To fetch current exchange markets use `.fetchMarkets()` method.

```js
await bitglobal.fetchMarkets();
```

This promice resolves to array of string with markets symbols.

```js
[ 'BTC/USDT', 'ETH/USDT', ... ]
```

## Fetch all tickers on exchange

To fetch only tickers of all markets use `.fetchTickers()` method.

```js
await bitglobal.fetchTickers();
```

The promice resolves to array of string with tickers.

```js
[ 'BTC', 'ETH' ... ]
```

## Complex example

```js
// import exchange class
import { BitGlobal } from 'zenfuse';

// Create exchange connection instance
const bitglobal = new BitGlobal();

// Fetch all markets
const markets = await bitglobal.fetchMarkets();
// FEtch all tickers
const tickers = await bitglobal.fetchTickers();

// Count it
console.log(
    `Bitglobal has ${markets.length} markets with ${tickers.length} listed tickers`,
);
// Show them all (\n is a line break)
console.log(`Markets:\n${markets.join(', ')}`);
console.log(`Tickers:\n${tickers.join(', ')}`);
```
