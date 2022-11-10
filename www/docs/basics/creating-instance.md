---
sidebar_position: 1
slug: /creating-instance
description: How to use exchange instance
---

# Creating instance

Before using exchange methods, you need to create instatnce. Each instance can has unique environment.

```js
import { Binance, FTX, OKX, BitGlobal } from 'zenfuse';

const binance = new Binance.spot()
const ftx = new FTX.spot();
const okx = new OKX.spot();
const bitglobal = new BitGlobal.spot();
```

The `spot` method definig only spot market instance.

:::note in development

For now only spot market is supported. Futures currently in development.

:::

## Instance options

```js
const binance = new Binance.spot({
    httpClientOptions: {
        prefixUrl: 'https://example.com', // Instead of binance.com/api
    },
    wsClientOptions: {
        followRedirects: true,
    },
})
```

| Parameter           | Type                                  | Description                                                                                         |
| ------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `httpClientOptions` | _`got.ExtendOptions`_                 | [`got.ExtendOptions`] are [got](https://github.com/sindresorhus/got) options, witch uses as fetcher |
| `wsClientOptions`   | _`ExtraWsOptions & ws.ClientOptions`_ | [ws](https://github.com/websockets/ws) options with `prefixUrl` support                             |

See [got options documentation](https://github.com/sindresorhus/got/blob/main/documentation/2-options.md) for more `httpClientOptions` examples.

See [ws options documentation](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options) for `wsClientOptions` examples
