<a href="https://zenfuse.js.dev">
<img style="text-align: right" src="www/static/img/zenfusejs-logo.svg" alt="Logo of zenfuse javascript library"/>
</a>

<!-- Should be sorted by popularity -->
[![Binance](www/static/img/exchanges/badges/binance-badge.svg)](https://binance.com)
[![FTX](www/static/img/exchanges/badges/FTX-badge.svg)](https://ftx.com)
[![OKX](www/static/img/exchanges/badges/OKX-badge.svg)](https://www.okx.com/)
[![Bitglobal](www/static/img/exchanges/badges/Bitglobal-badge.svg)](https://www.bitglobal.com/en-us)

# Comprehensive crypto trading library

[![CI](https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml/badge.svg)](https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml)
![Supported version](https://img.shields.io/node/v/zenfuse?logo=nodedotjs)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/github/zenfuse/zenfuse.js?logo=snyk)](https://snyk.io/vuln/npm:zenfuse)
[![Version](https://img.shields.io/npm/v/zenfuse?logo=npm)](https://www.npmjs.com/package/zenfuse)
</br>
[![Last Commit](https://img.shields.io/github/last-commit/zenfuse/zenfuse.js?logo=git)](https://github.com/zenfuse/zenfuse.js/commits)
[![Zenfuse Dev Tool](https://zenfuse.io/badges/devtool.svg)](https://zenfuse.io)

<!-- TOC depthfrom:2 updateonsave:false -->

-   [What is zenfuse.js?](#what-is-zenfusejs)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [Creating instance](#creating-instance)
    -   [Public fetching](#public-fetching)
    -   [.fetchMarkets](#fetchmarkets)
    -   [.fetchTickers](#fetchtickers)
    -   [.fetchPrice](#fetchprice)
        -   [All markets](#all-markets)
        -   [Specific market](#specific-market)
    -   [.ping](#ping)
-   [Private fetching](#private-fetching)
    -   [Authentication](#authentication)
    -   [.auth](#auth)
    -   [.hasKeys](#haskeys)
    -   [.postOrder](#postOrder)
    -   [.cancelOrderById](#cancelorderbyid)
    -   [.fetchBalances](#fetchbalances)
-   [Real-time events](#real-time-events)
    -   [Public events](#public-events)
        -   [.getMarketDataStream](#getmarketdatastream)
        -   [.open](#open)
        -   [.subscribeTo](#subscribeto)
        -   [.unsubscribeFrom](#unsubscribefrom)
        -   [.on](#on)
        -   [.close](#close)
    -   [Account events](#account-events)
        -   [.getAccountDataStream](#getaccountdatastream)
        -   [.open](#open)
        -   [.on](#on)
        -   [.close](#close)
-   [Configuration](#configuration)
    -   [All options](#all-options)
-   [Advanced things](#advanced-things)
    -   [Get original payload from exchange](#get-original-payload-from-exchange)
    -   [Any http fetching](#any-http-fetching)
        -   [.publicFetch](#publicfetch)
        -   [.privateFetch](#privatefetch)
-   [Full use cases](#full-use-cases)
    -   [Create order on Binance](#create-order-on-binance)
    -   [Using HTTP proxy](#using-http-proxy)
-   [THE BIG TODO](#the-big-todo)

<!-- /TOC -->

## What is zenfuse.js?

Zenfuse.js is crypto exchanges connector library. Currently, in active development.

**Features:**

-   Account orders manipulating
-   Fetching public markets data
-   Real-time events
    -   Public markets price
    -   Candlestick streams
    -   Account orders updating

**Exchanges**

-   [Binance](https://www.binance.com/en)
-   [FTX](https://ftx.com/)
-   [Bitglobal](https://www.bitglobal.com/en-us)
-   [OkX](https://www.okx.com/)

## Installation

```
npm install zenfuse
```

## Usage

### Creating instance

Any class of spot wallet has the same interface.
New instance has own options and namespace for one account.

```js
const { Binance, FTX, Bitglobal } = require('zenfuse');
// Imported exchanges classes of wallets, currently only spot markets.

const binance = new Binance['spot']();
const ftx = new FTX['spot']();
const bitglobal = new Bitglobal['spot']();
```

### Public fetching

All public methods exist in any exchange instance, even if it is not authenticated.

### `.fetchMarkets`

Fetching all markets that exist in exchange.

```js
await binance.fetchMarkets();
// ['BTC/BUSD', 'ETH/USDT', ...]

await ftx.fetchMarkets();
// ['BTC/USD', 'ETH/USDT', ... ]

await bitglobal.fetchMarkets();
// ['BTC/USDT', 'ETH/USDT', ... ]
```

### `.fetchTickers`

Fetching all tickers aka assets that exist in exchange.

```js
await binance.fetchTickers();
// ['BTC', 'ETH', ... ]

await ftx.fetchTickers();
// ['BTC', 'USD', ... ]

await bitglobal.fetchTickers();
// ['BTC', 'ETH', ... ]
```

### `.fetchPrice`

`fetchPrice(market?: sting)`

Fetch current market price

#### All markets

```js
binance.fetchPrice();
```

```js
[
    {
        symbol: 'BTC/USDT',
        price: 10999,
    },
    // ...
];
```

#### Specific market

If market specified, will return one object

```js
await ftx.fetchPrice('BTC/USD');
```

```js
{
    symbol: 'BTC/USD',
    price: 11069,
}
```

### `.ping`

Just ping the server to check availability.

```js
await binance.ping();
await ftx.ping();
```

## Private fetching

To use any methods for account, instance should have keys for it

### Authentication

### `.auth`

`auth({ publicKey: string, privateKey: string })`

`auth` method pass keys to instance. Returns self for chaining.

```js
binance.auth({
    publicKey: 'string',
    privateKey: 'sirwhenairdrop',
});
```

### `.hasKeys`

`hasKeys` returns boolean

```js
ftx.hasKeys; // false

ftx.auth({
    publicKey: 'string',
    privateKey: 'sirwhenairdrop',
});

ftx.hasKeys; // true
```

### `.postOrder`

`postOrder(order: ZenfuseOrder)`

Creates order on exchange

```js
ftx.hasKeys; // true

// Buying 0.0004 ETH by market price
await ftx.postOrder({
    symbol: 'ETH/USDT',
    type: 'market',
    side: 'buy',
    quantity: 0.0004,
});

// And selling same amount by limit order
await ftx.postOrder({
    symbol: 'ETH/USDT',
    type: 'limit',
    side: 'sell',
    price: 100, // Price is required for limit orders
    quantity: 0.0004,
});
```

This method resolves created order from exchange, this is `ZenfuseOrder` with some additional parameters.

```ts
{
    id: string, // Exchange order id
    timestamp: number, // UNIX Time
    status: 'new'|'open'|'closed'|'canceled',
    symbol: string,
    type: 'market'|'limit',
    side: 'buy'|'sell',
    price?: number,
    quantity: number,
}
```

`ZenfuseOrder` order parameters:

| Parameter  | Type                | Example     | Description                                      |
| ---------- | ------------------- | ----------- | ------------------------------------------------ |
| `symbol`   | `string`            | `CAKE/USDT` | Aka market aka ticker pair with `/` separator    |
| `type`     | `'market'\|'limit'` | `market`    | The most common order type. Currently, only two. |
| `side`     | `'buy'\|'sell'`     | `buy`       | Side of the order -\_-                           |
| `quantity` | `number`            | `1.337`     | Quantity of base ticker in order                 |
| `price`    | `number`            | `0.0069`    | The price for limit order                        |

**NOTE:** Any other parameters passed to postOrder will be appended to request

### `.cancelOrderById`

`cancelOrderById(orderId: string)`

Cancels order using order id.

```js
// Receive created order
const order = await binance.postOrder({
    symbol: 'DOGE/USDT',
    type: 'limit',
    side: 'buy',
    price: 0.0002,
    quantity: 10000,
});

const deletedOrder = await binance.cancelOrderById(order.id);

order.id === deletedOrder.id; // true
```

### `.fetchBalances`

Fetch account balances

```js
await binance.fetchBalances();
```

_Returns:_

```js
[
    {
        ticker: 'USDC',
        free: 25.75, // Non used amount of ticker
        used: 10, // Locked in orders and etc.
    },
    // ...
];
```

## Real-time events

Zenfuse.js uses [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter) for real-time data. Uses websocket connections. By default, can handle unlimited listeners.

### Public events

Any public events providing `MarketDataStream` interface.

#### `.getMarketDataStream`

Exchange instance method which return `MarketDataStream` interface. One instance for one websocket connection.

```js
binance.hasKeys; // false
const marketDataStream = binance.getMarketDataStream();
```

#### `.open`

Opens websocket connection. Makes possible to receive events.

```js
await marketDataStream.open();
```

#### `.subscribeTo`

`subscribeTo({ channel: string, symbol: string })`

Subscribes to specific event.

**NOTE:** This method send required payload to websocket, so when connection closes, all subscribed events gone.

```js
await marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'BTC/USDT',
});
```

#### `.unsubscribeFrom`

`unsubscribeFrom({ channel: string, symbol: string })`

Unsubscribes from specific event.

```js
await marketDataStream.unsubscribeFrom({
    channel: 'price',
    symbol: 'BTC/USDT',
});
```

#### `.on`

`on('newPrice', listener: ({ symbol: string, price: number }) => void)`

Price update event. Pass `symbol` and `price` to listener.

```js
marketDataStream.on('newPrice', (e) => {
    console.log(e.symbol, '->', e.price);
});
```

#### `.close`

Closes websocket connection. When you close websocket, all events are unsubscribed.

```js
await marketDataStream.close();
```

#### Event list

#### `price`

```js
await marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'BTC/USDT',
});

await marketDataStream.on('newPrice', (p) => {
    p.symbol; // BTC/USDT
    p.price; // 14708.3434
});
```

#### `candle`

```js
await marketDataStream.subscribeTo({
    channel: 'candle',
    symbol: 'BTC/USDT',
    interval: '1m',
});

await marketDataStream.on('candle', (c) => {
    c.symbol; // 'BTC/USDT'
    c.open; // 37808
    c.high; // 37824
    c.low; // 37756
    c.close; //  37773
    c.volume; // 125947.25939999998
    c.timestamp; // 1647212880000
    c.interval; // '1m'
    c.closeAt; // 1647212940000
    c.isClosed; // false
});
```

### Account events

Any public events providing `AccountDataStream` interface. Currently, only `orderUpdate` event supports.

#### `.getAccountDataStream`

Exchange instance method which return `AccountDataStream` interface. One instance for one websocket connection. Instance with keys required.

```js
ftx.hasKeys; // true
const accountDataStream = ftx.getAccountDataStream();
```

#### `.open`

Opens websocket connection. Starting emit events immediately. Returns self for chaining.

```js
await accountDataStream.open();
```

#### `.on`

`on('orderUpdate', listener: (order: ZenfuseOrder) => void)`

`orderUpdate` emits when open order changes his status. Like fills or cancellation.

```js
marketDataStream.on('orderUpdate', (order) => {
    order.status; // new order status
    order.id; // exchange order id
    // etc ...
});
```

#### `.close`

Closes websocket connection. Returns self for chaining.

```js
accountDataStream.close();
```

## Configuration

Exchange class constructor has options parameter.

```js
const { Binance } = require('zenfuse');

const options = {
    httpClientOptions: {
        prefixUrl: 'https://example.com', // Instead of binance.com/api
    },
    wsClientOptions: {
        followRedirects: true,
    },
};

const b = new Binance['spot'](options);
```

### All options

| Parameter           | Type                                  | Description                                                                                         |
| ------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `httpClientOptions` | [`got.ExtendOptions`]                 | [`got.ExtendOptions`] are [got](https://github.com/sindresorhus/got) options, witch uses as fetcher |
| `wsClientOptions`   | [`ExtraWsOptions & ws.ClientOptions`] | [ws](https://github.com/websockets/ws) options with `prefixUrl` support                             |

## Advanced things

### Get original payload from exchange

Any result what library return has `Symbol.for('zenfuse.originalPayload')` key, contains object returned from exchange API.

```js
const marketPrices = new FTX['spot']().fetchPrice();

marketPrices;
// [
//     {
//         symbol: 'BTC/USDT',
//         price: 10999,
//     },
//     // ...
// ];

marketPrices[Symbol.for('zenfuse.originalPayload')];
// {
//     success: true,
//     result: [
//         {
//             name: 'BTC/USDT',
//             enabled: true,
//             postOnly: false,
//             priceIncrement: 0.0001,
//         // ...
```

### Any http fetching

Both methods copy `got` interface:

-   [Full API here.](https://github.com/sindresorhus/got/tree/v11.8.3#api)
-   [GotOptions params](https://github.com/sindresorhus/got/tree/v11.8.3#options)

#### `.publicFetch`

`publicFetch(url: string, GotOptions)`

Can fetch any public data witch doesn't require authentication.
`publicFetch` modify this request as needed by the exchange.

_Example of https://docs.ftx.com/#get-historical-prices_

```js
// Fetch historical prices with pagination
const response = await ftx.publicFetch('markets/BTC-0628/candles', {
    method: 'GET',
    json: {
        resolution: 300,
        start_time: 1559881511,
        end_time: 1559881711,
    },
});

response;
// {
//     success: true,
//     result: [
//         {
//             close: 11055.25,
//             high: 11089.0,
//             low: 11043.5,
//             open: 11059.25,
//             startTime: '2019-06-24T17:15:00+00:00',
//             volume: 464193.95725,
//         },
//     ],
// };
```

#### `.privateFetch`

`privateFetch(url: string, GotOptions)`

Can fetch any data with required authentication.
Zenfuse will sign this request as needed by the exchange with the passed credentials.

_Example from https://binance-docs.github.io/apidocs/spot/en/#account-trade-list-user_data_

```js
binance.hasKeys; // true

const response = await binance.privateFetch('api/v3/myTrades', {
    method: 'GET',
    searchParams: {
        symbol: 'BNBBTC',
        orderId: 100234,
    },
});

response;
// [
//     {
//         symbol: 'BNBBTC',
//         id: 28457,
//         orderId: 100234,
//         orderListId: -1,
//         price: '4.00000100',
//         qty: '12.00000000',
//         quoteQty: '48.000012',
//         commission: '10.10000000',
//         commissionAsset: 'BNB',
//         time: 1499865549590,
//         isBuyer: true,
//         isMaker: false,
//         isBestMatch: true,
//     },
// ];
```

## Full use cases

### Create order on Binance

```js
const binance = new Binance['spot']().auth({
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.SECRET_KEY,
});

binance
    .postOrder({
        symbol: 'DOT/BUSD',
        quantity: 20,
        type: 'limit',
        side: 'buy',
        price: 500,
    })
    .then((order) => console.log('Created', order))
    .catch(({ message }) => console.log('Whoops:', message));
```

### Using HTTP proxy

```js
const { HttpsProxyAgent } = require('hpagent');

const options = {
    httpClientOptions: {
        agent: {
            https: new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                scheduling: 'lifo',
                proxy: 'https://localhost:8080',
            }),
        },
    },
};

const ftx = new FTX['spot'](options);
ftx; // All HTTP requests will be proxied, except websockets
```

## THE BIG TODO

Features:

-   [ ] Add Okx exchange
-   [ ] Add Huobi exchange
-   [ ] Add `orderbook` event in `MarketDataStream`
-   [ ] Add more order types
-   [ ] Add futures support (big thing)
-   [x] Add `fetchOrderById` method

Internal:

-   [ ] Add full API doc wiki based on jsdoc
-   [ ] Add a lot of use cases example in GitHub wiki
-   [x] Add [zod](https://github.com/colinhacks/zod) integration with testing output and argument validation
-   [ ] Add mocked websocket testing (big thing)
-   [ ] Refactor utils function, make them a method of the class

[`got.extendoptions`]: https://github.com/sindresorhus/got/blob/3a84454208e39aae7f2bae0bf68b7ede2872f317/source/types.ts#L54
