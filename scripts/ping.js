const task = require('tasuku');
const zenfuse = require('zenfuse');

const ping = async (name, task) => {
    const exchange = new zenfuse[name].spot();
    const hostname = exchange.options.httpClientOptions.prefixUrl;

    task.setStatus(hostname);

    const startTime = Date.now();

    await exchange.ping();

    task.setOutput(`${Date.now() - startTime} ms`);
};

(async () => {
    await task('Binance', async (task) => await ping('Binance', task));
    await task('Bitglobal', async (task) => await ping('Bitglobal', task));
    await task('OKX', async (task) => await ping('OKX', task));
    await task('Huobi', async (task) => await ping('Huobi', task));
})().catch(() => {});
