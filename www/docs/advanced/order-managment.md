---
description: How to manage your orders
slug: /order-management
---

# Order managment

:::tip API test environment

If you dont want to post real orders on your exchange account, you can use testnet API.

[**See testnet guide**](/docs/advanced/using-testnet)

:::

## Requirements

Using methods for order management required to specify account API keys.
Here is OKX example.

```js
import { OKX } from 'zenfuse';

// Creating connecton instance
conts okx = new OKX.spot()

// Authenticate instance
okx.auth({
    publicKey: '***',
    privateKey: '***'
});

okx.hasKeys // true
```

## About order object

This object returns as a result of order posting.

```ts
{
    id: string, // Exchange order id
    timestamp: number, // UNIX Time
    status: 'new'|'open'|'closed'|'canceled', // Current status of order
    symbol: string,
    type: 'market'|'limit',
    side: 'buy'|'sell',
    price?: number,
    quantity: number,
}
```

## Post new order

To post new order use `.postOrder()` method. It's returns promice with a result.

Buy BTC by market example:

```js
await okx.postOrder({
    symbol: 'BTC/USDT',
    type: 'market',
    side: 'buy',
    quantity: 0.004,
});
```

Sell ETH by limit order example:

```js
await okx.postOrder({
    symbol: 'ETH/USDC',
    type: 'limit',
    side: 'buy',
    price: 9999,
    quantity: 42,
});
```

## Fetch open orders

:::note In development

Currently `.fetchOpenOrders()` in development. Fetch one by one for now.

:::

## Fetch specific order

:::info recomendation

Some exchanges required order id **and symbol** for order fetching.
Find your order only by id is possible but additional requests required in some exchanges.
So if you carry about request rate use `fetchOrder`. If you only have id of the order use `fetchOrderById`.

:::

### By order object

```js
await okx.fetchOrder({
    orderId: 'order123',
    symbol: 'BTC/USDT',
});
```

### Only by id

```js
await okx.fetchOrderById('orderId');
```

## Cancel order

:::info recomendation

Some exchanges required order id **and symbol** for order canceling.
Cancel your order only by id is possible but additional requests is required in some exchanges.
So if you carry about request rate use `cancelOrder`. If you only have id of the order use `cancelOrderById`.

:::

### By order object

```js
await okx.cancelOrder({
    id: 'orderId',
    symbol: 'BTC/USDC',
});
```

### Only by id

```js
await okx.cancelOrderById('orderId');
```

## Fetch order history

:::note In development

Currently `.fetchOrderHistory()` in development. Fetch one by one for now.

:::
