const task = require('tasuku');
const zenfuse = require('zenfuse');

const HTTPError = require('got').HTTPError;

const ping = async (name, task) => {
    const exchange = new zenfuse[name].spot();
    const hostname = exchange.options.httpClientOptions.prefixUrl;

    task.setStatus(hostname);

    const startTime = Date.now();
    const getEndTime = () => `${Date.now() - startTime} ms`;

    return await exchange
        .ping()
        .then(() => task.setOutput(getEndTime()))
        .catch((err) => handleError(err, task))
};

const handleError = (err, task) => {
    if (err.httpError instanceof HTTPError) {
        task.setError(err.httpError);
        return;
    } else {
        throw err;
    }
};

(async () => {
    task('Binance', async (task) => ping('Binance', task));
    task('Bitglobal', async (task) => ping('Bitglobal', task));
    task('OKX', async (task) => ping('OKX', task));
    task('Huobi', async (task) => ping('Huobi', task));
})().catch((err) => {
    debugger;
});

/**
 *  Fix for error handler in ./node_modules/yoga-layout-prebuilt/yoga-layout/build/Release/nbind.js:53
 */
process.setUncaughtExceptionCaptureCallback((err) => {
    if (!(err.httpError instanceof HTTPError)) {
        throw err;
    }
});
