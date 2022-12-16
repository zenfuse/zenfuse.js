---
slug: /creating-instance
description: How to use exchange instance
---

# Creating instance

Before using exchange methods, you need to create instance.
Each instance can has unique environment and specifying scope of connection usage.

## Example

Example with all exchanges classes:

```js
import { Binance, FTX, OKX, BitGlobal } from 'zenfuse';

const binance = new Binance.spot();
const ftx = new FTX.spot();
const okx = new OKX.spot();
const bitglobal = new BitGlobal.spot();
```

When instance is created, you are able to use methods for exchange.
The `spot` method defining only spot market instance.

:::note in development

For now only spot market is supported. Futures currently in development.

:::

## Configure instance

Each instance can be configure separately. Basically you just able to configure lib dependencies.

Example with changing Binance API endpoint:

```js
const binance = new Binance.spot({
    httpClientOptions: {
        prefixUrl: 'https://example.com', // Insted of binance.com/api
    },
});
```

For more information see configuration guide.
