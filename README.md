# zenfuse.js

[![CI](https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml/badge.svg)](https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml)
![Supported version](https://img.shields.io/node/v/zenfuse)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/github/zenfuse/zenfuse.js)](https://snyk.io/vuln/npm:zenfuse)
[![Version](https://img.shields.io/npm/v/zenfuse)](https://www.npmjs.com/package/zenfuse)

NodeJS connector for Binance and FTX. Currently, in development.

### Features:

-   Account orders manipulating
-   Fetching public markets data
-   Real-time events
    -   Public markets price
    -   Account orders updating

## Installation

```
npm install zenfuse
```

## Usage

### Creating instance

Any class of spot wallet has the same interface.
New instance has own options and namespace for one account.

```js
const { Binance, FTX } = require('zenfuse');
// Imported exchanges classes of wallets, currently only spot markets.

const binance = new Binance['spot']();
const FTX = new FTX['spot']();
```

### Public fetching

All public methods exist in any exchange instance, even if it is not authenticated.

### `fetchMarkets()`

Fetching all markets that exist in exchange.

```js
await binance.fetchMarkets();
// ['BTC/BUSD', 'ETH/USDT', ...]
```

```js
await ftx.fetchMarkets();
// ['BTC/USD', 'ETH/USDT', ... ]
```

### `fetchTickers()`

Fetching all tickers aka assets that exist in exchange.

```js
await binance.fetchTickers();
// ['BTC', 'ETH', ... ]

await ftx.fetchTickers();
// ['BTC', 'USD', ... ]
```

### `fetchPrice(market?: sting)`

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

### `ping()`

Just ping the server to check availability.

```js
await binance.ping();
await ftx.ping();
```

## Private fetching

To use any methods for account, instance should have keys for it

### Authentication

### `auth()`

`auth` method pass keys to instance. Returns self for chaining.

```js
binance.auth({
    publicKey: 'string',
    privateKey: 'sirwhenairdrop',
});
```

### `hasKeys`

`hasKeys` returns boolean

```js
ftx.hasKeys; // false

ftx.auth({
    publicKey: 'string',
    privateKey: 'sirwhenairdrop',
});

ftx.hasKeys; // true
```

### `createOrder(order: ZenfuseOrder)`

Creates order on exchange

```js
ftx.hasKeys; // true

// Buying 0.0004 ETH by market price
await ftx.createOrder({
    symbol: 'ETH/USDT',
    type: 'market',
    side: 'buy',
    quantity: 0.0004,
});

// And selling same amount by limit order
await ftx.createOrder({
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

**NOTE:** Any other parameters passed to createOrder will be appended to request

### `cancelOrderById(orderId: string)`

Cancels order using order id.

```js
// Recieve created order
const order = await binance.createOrder({
    symbol: 'DOGE/USDT',
    type: 'limit',
    side: 'buy',
    price: 0.0002,
    quantity: 10000,
});

const deletedOrder = await binance.cancelOrderById(order.id);

order.id === deletedOrder.id; // true
```

### `fetchBalances()`

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

Zenfuse.js uses [EventEmiter](https://nodejs.org/api/events.html#class-eventemitter) for real-time data. Uses websocket connections. By default, can handle unlimited listeners.

### Public events

Any public events providing `MarketDataStream` inteface. Currently, only `newPrice` event supports.

#### `getMarketDataStream()`

Exchange instance method which return `MarketDataStream` interface. One instance for one websocket connection.

```js
binance.hasKeys; // false
const marketDataStream = binance.getMarketDataStream();
```

#### `open()`

Opens websocket connection. Makes possible to receive events.

```js
await marketDataStream.open();
```

#### `subscribeTo({ channel: 'price', symbol: string })`

Subscribes to specific event.

**NOTE:** This method send required payload to websocket, so when connection closes, all subscribed events gone.

```js
await marketDataStream.subscribeTo({
    channel: 'price',
    symbol: 'BTC/USDT',
});
```

#### `unsubscribeFrom({ channel: 'price', symbol: string })`

Unsubscribes from specific event.

```js
await marketDataStream.unsubscribeFrom({
    channel: 'price',
    symbol: 'BTC/USDT',
});
```

#### `on('newPrice', listener: ({ symbol: string, price: number }) => void)`

Price update event. Pass `symbol` and `price` to listener.

```js
marketDataStream.on('newPrice', (e) => {
    console.log(e.symbol, '->', e.price);
});
```

#### `close()`

Closes websocket connection.

```js
await marketDataStream.close();
```

### Account events

Any public events providing `AccountDataStream` interface. Currently, only `orderUpdate` event supports.

#### `getAccountDataStream()`

Exchange instance method which return `AccountDataStream` interface. One instance for one websocket connection. Instance with keys required.

```js
ftx.hasKeys; // true
const accountDataStream = ftx.getAccountDataStream();
```

#### `open()`

Opens websocket connection. Starting emit events immediately. Returns self for chaining.

```js
await accountDataStream.open();
```

#### `on('orderUpdate', listener: (order: ZenfuseOrder) => void)`

`orderUpdate` emits when open order changes his status. Like fills or cancelation.

```js
marketDataStream.on('orderUpdate', (order) => {
    order.status; // new order status
    order.id; // exchange order id
    // etc ...
});
```

#### `close()`

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
        prefixUrl: 'https://example.com', // Insted of binance.com/api
    },
    wsClientOptions: {
        followRedirects: true,
    },
};

const b = new Binance['spot'](options);
```

### All options

| Parameter           | Type                                  | Description                                                                                        |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `httpClientOptions` | [`got.ExtendOptions`]                 | [`got.ExtendOptions`] are [got](https://github.com/sindresorhus/got) optins, witch uses as fetcher |
| `wsClientOptions`   | [`ExtraWsOptions & ws.ClientOptions`] | [ws](https://github.com/websockets/ws) options with `prefixUrl` support                            |

## Advanced things

...

## Full use cases

### Create order on Binance

```js
const { Binance } = require('zenfuse');

const binance = new Binance['spot']().auth({
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.SECRET_KEY,
});

binance
    .createOrder({
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

-   [ ] Add Okex exchange
-   [ ] Add Huobi exchange
-   [ ] Add `orderbook` event in `MarketDataStream`
-   [ ] Add more order types
-   [ ] Add futures support (big thing)
-   [x] Add `fetchOrderById` method

Internal:

-   [ ] Add full API doc wiki based on jsdoc
-   [ ] Add a lot of use cases example in GitHub wiki
-   [ ] Add [zod](https://github.com/colinhacks/zod) integration with testing output and argument validation
-   [ ] Add mocked websocket testing (big thing)

[`got.extendoptions`]: https://github.com/sindresorhus/got/blob/3a84454208e39aae7f2bae0bf68b7ede2872f317/source/types.ts#L54
