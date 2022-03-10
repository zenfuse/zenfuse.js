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
                        endpoint: 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000',
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
                        endpoint: 'https://ftx.com/api/markets/BTC/USDT/candles?resolution=60',
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
                    setOutput(path.relative(__dirname + '/../', filePath));
                });
        });
    }
};
