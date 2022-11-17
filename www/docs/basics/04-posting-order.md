---
slug: /posting-order
description: How to post new order
---

# Posting order

This is basic guide how to post your new order on Binance.

:::tip API test environment

If you dont want to post real orders on your exchange account, you can use testnet API.

[**See testnet guide**](/docs/advanced/using-testnet)

:::

## Authenticate your instance

To post new order you need authenticate your instance with account API keys.

Use `.auth()` method for it.

```js
import { Binance } form 'zenfuse';

const binance = new Binance();

binance.auth({
    publicKey: '',
    privateKey: ''
})
```

:::note Where to get API keys?

Every supported exchange can create API keys for your account. For Binance it's in [specific settings page](https://www.binance.com/en/my/settings/api-management). Basicaly on every other exchange is the same.

:::

Now you have authenticated instance, to check it use `.hasKeys` getter.

```js
binance.hasKeys; // returns true
```

## Send new order to binance

To send new order use `.postOrder` method with your order parameters.

Makret order example:

```js
// Buying 0.0004 ETH by market price
await binance.postOrder({
    symbol: 'ETH/USDT',
    type: 'market',
    side: 'buy',
    quantity: 0.0004,
});
```

Limit order example:

```js
// Selling the same amount of ETH by limit order
await binance.postOrder({
    symbol: 'ETH/USDT',
    type: 'limit',
    side: 'sell',
    price: 100, // Price is required for limit orders
    quantity: 0.0004,
});
```

Interface explanation:

-   **`symbol`** Market symbol with `/` separator
-   **`type`** Order type. Can be `market` or `limit`
-   **`side`** `buy` or `sell`
-   **`quantity`** The quantity of base ticker. In example above its how much `ETH` you want to buy or sell
-   **`price`** If your order is `limit`. You need to specify the price of base ticker

If order posted succesefuly. Promice will resolves to this object:

```js
{
    id: string,
    timestamp: number,
    status: 'open'|'closed'|'canceled',
    symbol: string,
    type: 'market'|'limit',
    side: 'buy'|'sell',
    price?: number,
    quantity: number,
}
```

It's simply returns your order with some additional keys:

-   **`id`** Order id. In this case Binance give it
-   **`timestamp`** UNIX time when order is posted
-   **`status`** Current status of this order:
    -   `open` Unfilled limit order
    -   `closed` Fully filled order
    -   `canceled` Order canceled by user

### Full example

```js
import { Binance } form 'zenfuse';

cosnt binance = new Binance();

binance.auth({
    publicKey: '***'
    secretKey: '***'
});

const order = await binance.postOrder({
    symbol: 'DOGE/USDT',
    type: 'limit',
    side: 'buy',
    price: 0.0002,
    quantity: 10000,
})
    .catch(err => {
        console.log(`Error when posting order: ${err.code}`);
        process.exit(1);
    });

console.log('Succesfuly post order');
console.log('Order id:', order.id);
```
