<a href="https://zenfuse.js.org" target="_blank">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/zenfusejs-logo-no-frame-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/zenfusejs-logo-no-frame-black.svg">
  <img alt="zenfuse.js logo" src="https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/zenfusejs-logo-no-frame-black.svg">
</picture>
</a>

<!-- Should be sorted by popularity -->
[![Binance](https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/exchanges/badges/binance-badge.svg)](https://binance.com)
[![FTX](https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/exchanges/badges/FTX-badge.svg)](https://ftx.com)
[![OKX](https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/exchanges/badges/OKX-badge.svg)](https://www.okx.com)
[![Bitglobal](https://raw.githubusercontent.com/zenfuse/zenfuse.js/main/www/static/img/exchanges/badges/Bitglobal-badge.svg)](https://www.bitglobal.com/en-us)

# Comprehensive crypto trading library

![Supported version](https://img.shields.io/node/v/zenfuse?logo=nodedotjs)
[![Version](https://img.shields.io/npm/v/zenfuse?logo=npm)](https://www.npmjs.com/package/zenfuse)
[![Last Commit](https://img.shields.io/github/last-commit/zenfuse/zenfuse.js?logo=git)](https://github.com/zenfuse/zenfuse.js/commits)
[![Zenfuse Dev Tool](https://zenfuse.io/badges/devtool.svg)](https://zenfuse.io)

> **Note**
>  This library is in active state of development. New exchanges and features incoming. We really need your feedback to make this tool better. Feel free to [create any issue](https://github.com/zenfuse/zenfuse.js/issues) or ask about anything in [Github Discussions](https://github.com/zenfuse/zenfuse.js/discussions).

This is a crypto trading library connector for Node.js. For trading, analyze, visualize and manage any data from API easily on supported exchanges.

Using many different crypto exchange API's is a drag. Different interfaces, namings, payload signing, symbols separator and etc. Zenfuse.js handles it, and provides clean, powerful solution for modern javascript environment.

### ✨ Key features:

-   🗃️ **Data fetching:** Market price, ticker listing, historical chart and any custom requests
-   💱 **Orders manipulating:** Post, cancel and modify exchange orders
-   🗠 **Real-time events:** Websocket streams
    -   **Candlesticks streams:** Kline streams for charts, even when the exchange doesn't support this **(!)**
    -   **Current price:** Simplified price of market
    -   **Trades:** Actual market trades
    -   **Account events:** Balance changing and new orders posting
    
### Simple Binance example

```js
import { Binance } from 'zenfuse';

// Creating connection instance
const binance = new Binance.spot(options);

// Fetch current BTC price
binance.fetchPrice('BTC/USDT');

// Post order
binance.auth(creds).postOrder(params);
```

### See full documentation in [zenfuse.js.org](https://zenfuse.js.org)

---

"Talk is cheap. Show me the code."

#### More code showcase
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

For more examples and guides see https://zenfuse.js.org/docs/intro
