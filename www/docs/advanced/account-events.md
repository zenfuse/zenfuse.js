---
description: How to handle real time events on exchange account
slug: /account-events
---

# Account real-time events

## Setup stream

Real time events based on [EventEmmiter](https://nodejs.org/api/events.html#class-eventemitter) class.

### Authenticate exchange connection

To create account stream, authenticated connection is required.

Binance example:

```js
import { Binance } from 'zenfuse';

cosnt binance = new Binance.spot();

binance.auth({
    publicKey: '***',
    secretKey: '***'
});

```

After your able to get stream instance using `.getAccountDataStream()` method.

```js
const accountDataStream = binance.getAccountDataStream();
```

Use `.open()` method to open websocket connection and start recieving

```js
accountDataStream.open();
```

## Receiving order updates

Add listener to `orderUpdate` event to recieving new/updated orders on account

```js
accountdatastream.on('orderUpdate', (order) => {
    order.status; // new order status
    order.id; // exchange order id
    // etc ...
});
```
