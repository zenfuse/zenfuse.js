const task = require('tasuku');
const zenfuse = require('zenfuse');

(async () => {
    await task('Binance', async ({ setStatus, setOutput }) => {
        const binance = new zenfuse.Binance.spot();
        const hostname = binance.options.httpClientOptions.prefixUrl;

        setStatus(hostname);

        const startTime = Date.now();

        await binance.ping();

        setOutput(`${Date.now() - startTime} ms`);
    });

    await task('Bitglobal', async ({ setStatus, setOutput }) => {
        const bitglobal = new zenfuse.Bitglobal.spot();
        const hostname = bitglobal.options.httpClientOptions.prefixUrl;

        setStatus(hostname);

        const startTime = Date.now();

        await bitglobal.ping();

        setOutput(`${Date.now() - startTime} ms`);
    });

    await task('OKX', async ({ setStatus, setOutput }) => {
        const okx = new zenfuse.OKX.spot();
        const hostname = okx.options.httpClientOptions.prefixUrl;

        setStatus(hostname);

        const startTime = Date.now();

        await okx.ping();

        setOutput(`${Date.now() - startTime} ms`);
    });

    await task('Huobi', async ({ setStatus, setOutput }) => {
        const huobi = new zenfuse.Huobi.spot();
        const hostname = huobi.options.httpClientOptions.prefixUrl;

        setStatus(hostname);

        const startTime = Date.now();

        await huobi.ping();

        setOutput(`${Date.now() - startTime} ms`);
    });

    await task('FTX', async ({ setStatus, setOutput }) => {
        const ftx = new zenfuse.FTX.spot();
        const hostname = ftx.options.httpClientOptions.prefixUrl;

        setStatus(hostname);

        const startTime = Date.now();

        await ftx.ping();

        setOutput(`${Date.now() - startTime} ms`);
    });
})().catch(() => {});
