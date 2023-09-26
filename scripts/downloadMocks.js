const task = require('tasuku');
const got = require('got');
const mri = require('mri');

const fs = require('fs/promises');
const path = require('path');

const HTTPError = require('got').HTTPError;

const options = mri(process.argv.slice(2), {
    alias: {
        f: 'force',
        h: 'help',
        clear: 'clean',
    },
    default: {
        only: '',
        force: false,
    },
});

if (options.help) {
    const helpMessage = `Usage: downloadMocks.js [options...]
-f, --force           Download even files already exists 
    --only=<exchange> Run for specific exchange
    --clean           Delete all downloaded files`;
    process.stdout.write(helpMessage);
    process.stdout.write('\n');
    process.exit(0);
}

const nameExp = new RegExp(`^${options.only}`, 'i');
const isOnly = (name) => nameExp.test(name);

task('Preparing mocks', async ({ task, setStatus }) => {
    if (options.force) {
        setStatus('forced');
    }

    return await task.group(
        (task) => [
            task('Binance', ({ task, setStatus }) => {
                if (!isOnly('binance')) {
                    setStatus('skipped');
                    return;
                }

                const mocksPath =
                    __dirname + '/../tests/exchanges/binance/mocks/static/';

                const downloadList = [
                    {
                        filename: 'exchangeInfo.json',
                        endpoint: 'https://api.binance.com/api/v3/exchangeInfo',
                    },
                    {
                        filename: 'prices.json',
                        endpoint: 'https://api.binance.com/api/v3/ticker/price',
                    },
                    {
                        filename: 'history.json',
                        endpoint:
                            'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000',
                    },
                ];

                if (options.clean) {
                    return removeEach(mocksPath, downloadList, task);
                }

                return downloadEach(mocksPath, downloadList, task);
            }),
            task('Bitglobal', ({ task, setStatus, setWarning }) => {
                ///////
                if (isOnly('bitglobal')) {
                    setStatus('skipped by default');
                    setWarning('Bitglobal is currently not supported');
                    return;
                }
                ///////

                if (!isOnly('bitglobal')) {
                    setStatus('skipped');
                    return;
                }
                const mocksPath =
                    __dirname + '/../tests/exchanges/bitglobal/mocks/static/';

                const downloadList = [
                    {
                        filename: 'spot.json',
                        endpoint:
                            'https://global-openapi.bithumb.pro/openapi/v1/spot/ticker?symbol=ALL',
                    },
                    {
                        filename: 'kline.json',
                        endpoint:
                            'https://global-openapi.bithumb.pro/openapi/v1/spot/kline?symbol=BTC-USDT&type=m1&start=1646690750&end=1647694350',
                    },
                    {
                        filename: 'spotConfig.json',
                        endpoint:
                            'https://global-openapi.bithumb.pro/openapi/v1/spot/config',
                    },
                ];

                if (options.clean) {
                    return removeEach(mocksPath, downloadList, task);
                }

                return downloadEach(mocksPath, downloadList, task);
            }),
            task('OKX', ({ task }) => {
                if (!isOnly('okx')) {
                    setStatus('skipped');
                    return;
                }
                const mocksPath =
                    __dirname + '/../tests/exchanges/okx/mocks/static/';

                const downloadList = [
                    {
                        filename: 'spot.json',
                        endpoint:
                            'https://okx.com/api/v5/market/tickers?instType=SPOT',
                    },
                    {
                        filename: 'history.json',
                        endpoint:
                            'https://okx.com/api/v5/market/history-candles?instId=BTC-USDT',
                    },
                ];

                if (options.clean) {
                    return removeEach(mocksPath, downloadList, task);
                }

                return downloadEach(mocksPath, downloadList, task);
            }),
            task('Huobi', ({ task }) => {
                if (!isOnly('huobi')) {
                    setStatus('skipped');
                    return;
                }

                const mocksPath =
                    __dirname + '/../tests/exchanges/huobi/mocks/static/';

                const downloadList = [
                    {
                        filename: 'tickers.json',
                        endpoint:
                            'https://api.huobi.pro/v2/settings/common/currencies',
                    },
                    {
                        filename: 'markets.json',
                        endpoint:
                            'https://api.huobi.pro/v2/settings/common/symbols',
                    },
                    {
                        filename: 'pairs.json', // ticker pairs
                        endpoint: 'https://api.huobi.pro/market/tickers',
                    },
                    {
                        filename: 'candles.json',
                        endpoint:
                            'https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=2000',
                    },
                ];

                if (options.clean) {
                    return removeEach(mocksPath, downloadList, task);
                }

                return downloadEach(mocksPath, downloadList, task);
            }),
        ],
        {
            concurrency: Infinity,
        },
    );
});

const removeEach = (mocksPath, downloadList, task) => {
    for (const { filename } of downloadList) {
        const filePath = mocksPath + filename;

        task(filename, async ({ setStatus, setOutput }) => {
            await fs
                .rm(filePath)
                .then(() => setStatus('removed'))
                .then(() =>
                    setOutput(path.resolve(__dirname + '/../', filePath)),
                )
                .catch((err) => {
                    if (err.code === 'ENOENT') {
                        setStatus('no such file');
                    } else {
                        throw err;
                    }
                });
        });
    }
};

const downloadEach = (mocksPath, downloadList, task) => {
    for (const { filename, endpoint } of downloadList) {
        const filePath = path.resolve(__dirname + '/../', mocksPath + filename);

        task(filename, async ({ setStatus, setOutput }) => {
            const isExists = await fs.stat(filePath).catch((err) => {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            });

            if (isExists && !options.force) {
                setStatus('exists');
                return;
            }

            await got(endpoint)
                .then((res) => {
                    return fs.writeFile(filePath, res.body);
                })
                .then(() => {
                    setStatus('downloaded');
                    setOutput(filePath);
                });
        });
    }
};

const handleError = (err) => {
    if (!(err instanceof HTTPError)) {
        throw err;
    }
    process.exitCode = 1;
}

/**
 *  Fix for error handler in ./node_modules/yoga-layout-prebuilt/yoga-layout/build/Release/nbind.js:53
 */
process.setUncaughtExceptionCaptureCallback(handleError);
process.on('unhandledRejection', handleError);