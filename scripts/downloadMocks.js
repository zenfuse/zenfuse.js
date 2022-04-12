const task = require('tasuku');
const got = require('got');

const fs = require('fs');
const util = require('util');
const path = require('path');

const writeFile = util.promisify(fs.writeFile);

const isForce = process.argv.includes('--force');

task('Preparing mocks', async ({ task, setStatus }) => {
    if (isForce) {
        setStatus('Forced');
    }

    await task.group(
        (task) => [
            task('Binance', ({ task }) => {
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

                run(mocksPath, downloadList, task);
            }),
            task('FTX', ({ task }) => {
                const mocksPath =
                    __dirname + '/../tests/exchanges/ftx/mocks/static/';

                const downloadList = [
                    {
                        filename: 'markets.json',
                        endpoint: 'https://ftx.com/api/markets',
                    },
                    {
                        filename: 'history.json',
                        endpoint:
                            'https://ftx.com/api/markets/BTC/USDT/candles?resolution=60',
                    },
                ];

                run(mocksPath, downloadList, task);
            }),
            task('Bithumb', ({ task }) => {
                const mocksPath =
                    __dirname + '/../tests/exchanges/bithumb/mocks/static/';

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
                ];

                run(mocksPath, downloadList, task);
            }),
            task('OKX', ({ task }) => {
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

                run(mocksPath, downloadList, task);
            }),
        ],
        {
            concurrency: Infinity,
        },
    );
});

const run = (mocksPath, downloadList, task) => {
    for (const { filename, endpoint } of downloadList) {
        const filePath = mocksPath + filename;

        task(filename, async ({ setStatus, setOutput }) => {
            if (fs.existsSync(filePath) && !isForce) {
                setStatus('File exists');
                return;
            }

            await got(endpoint)
                .then((res) => {
                    return writeFile(filePath, res.body);
                })
                .then(() => {
                    setStatus('Downloaded');
                    setOutput(path.resolve(__dirname + '/../', filePath));
                });
        });
    }
};
