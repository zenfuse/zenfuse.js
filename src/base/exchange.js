const got = require('got');

const pkg = require('../../package.json');

class ExchangeBase {
    defaultHttpClientOptions = {
        responseType: 'json',
        resolveBodyOnly: true,
        headers: {
            'user-agent': `${pkg.name}/${pkg.version} (${pkg.homepage})`,
        },
    };

    /**
     * @param {got.ExtendOptions} httpClientOptions
     * @param {string | URL} agentOptions.prefixUrl
     */
    constructor(httpClientOptions) {
        const options = Object.assign(
            this.defaultHttpClientOptions,
            httpClientOptions,
        );

        this.options = options;
        this.fetcher = got.extend(options);
    }
}

module.exports = ExchangeBase;
