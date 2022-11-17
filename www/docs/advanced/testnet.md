---
description: How to connect testnet API
slug: using-testnet
---

# Using testnet API

In the testnet API you have many different virtual assets to trade for testing purposes.

See [Binance Testnet FAQ](https://testnet.binance.vision/#:~:text=See%20older%20changes-,F.A.Q.,-How%20can%20I) for more details.

:::info Only Binance testnet

Right now only Binance testnet is supported.
Because testnet API doesn't exits on different exchanges.

:::

## Get your API keys

#### 1. Go to [Binance Testnet Page](https://testnet.binance.vision/) and Log in using GitHub account

<img
src={require('../assets/binance-testnet(login).png').default}
alt="Binance Tesnet Login"
width="50%"
/>

#### 2. Click "Generate HMAC_SHA256 Key"

<img
src={require('../assets/binance-testnet(keys).png').default}
alt="Binance Tesnet Keys"
width="50%"
/>

#### 3. Provide description and click "Generate"

<img
src={require('../assets/binance-testnet(description).png').default}
alt="Binance Tesnet Description"
width="50%"
/>

#### 4. Then you will get your public key and secret key

<img
src={require('../assets/binance-testnet(result).png').default}
alt="Binance Tesnet Result"
width="50%"
/>

## Setup Binance testnet connection

-   Use `httpClientOptions.prefixUrl` option to change target hostname.
-   Use `wsClientOptions.prefixUrl` option to change target hostname for websocket connection.

:::note Note

`prefixUrl` should be specified without any path

:::

```js
import { Binance } from 'zenfuse';

const binanceTestnet = new Binance.spot({
    httpClientOptions: {
        prefixUrl: 'https://testnet.binance.vision',
    },
    wsClientOptions: {
        prefixUrl: 'wss://testnet.binance.vision',
    },
});
```

To test connection use `.ping()`;

```js
await binanceTestnet.ping();
```

## Authenticate account

Use `.auth()` method to authenticate Binance connection instance. With keys what you get from testnet.

```js
binanceTestnet.auth({
    publicKey:
        'ExT5mi2YQZXvFb6CM8SkmoOJIFywlhYlNvKMZTedLwK3vou8EpWRSGKf3jNKp13l',
    privateKey:
        'ac9CxYIxizS4f3qdwwjKa0uiAeDbChGaDyxiaIWvPQMd3VjPMenvIpHmpLsgVbCx',
});
```

## Done

Now this instatnce uses Binance testnet servers with your account.

```js
binanceTestnet.fetchBalances().then(console.log);
```

Output:

```js
[
    { ticker: 'BNB', free: 1000, used: 0 },
    { ticker: 'BTC', free: 1, used: 0 },
    { ticker: 'BUSD', free: 10000, used: 0 },
    { ticker: 'ETH', free: 100, used: 0 },
    { ticker: 'LTC', free: 500, used: 0 },
    { ticker: 'TRX', free: 500000, used: 0 },
    { ticker: 'USDT', free: 10000, used: 0 },
    { ticker: 'XRP', free: 50000, used: 0 },
];
```
