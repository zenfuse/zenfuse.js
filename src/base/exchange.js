const got = require('got');
const mergeObjects = require('deepmerge');
const z = require('zod');

const pkg = require('../../package.json');
const ZenfuseValidationError = require('./errors/validation.error');
const OrderParamsSchema = require('./schemas/orderParams');
const KlineSchema = require('./schemas/kline');

/**
 * @typedef {object} ExtraWsOptions
 * @property {string} prefixUrl When specified, `prefixUrl` will be
 *      prepended to websocket `url`.
 *      **Note:** Path will be overwritten
 */

/**
 * @typedef {object} BaseOptions
 * @property {import('got').ExtendOptions} httpClientOptions This object will be passed to `got.extend`
 * @property {ExtraWsOptions & import('ws').ClientOptions} wsClientOptions Websocket client options based on `ws` lib with some extra parameters
 */

const userAgent = `${pkg.name}/${pkg.version} (${pkg.homepage}) node/${process.version} ${process.platform} ${process.arch}`;

class ExchangeBase {
    /**
     * @type {BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            resolveBodyOnly: true,
            headers: {
                'user-agent': userAgent,
            },
        },
        wsClientOptions: {
            headers: {
                'user-agent': userAgent,
            },
            rejectUnauthorized: true,
        },
    };

    /**
     * @param {BaseOptions} options
     */
    constructor(options = {}) {
        const assignedOptions = mergeObjects(
            ExchangeBase.DEFAULT_OPTIONS,
            options,
        );

        this.options = assignedOptions;

        this.fetcher = got.extend(this.options.httpClientOptions);

        this.orderSchema = OrderParamsSchema.refine(
            ({ symbol }) => symbol.split('/').length === 2,
            {
                message: 'Symbol should have valid "/" separator',
            },
        );
    }

    validateOrderParams(order) {
        const result = this.orderSchema.safeParse(order);

        if (result.success) return;

        throw new ZenfuseValidationError('InvalidOrder', result.error);
    }

    validateCandleHistoryParams(params) {
        const paramsSchema = z.object({
            symbol: KlineSchema.shape.symbol,
            interval: KlineSchema.shape.interval,
            startTime: z.number().optional(),
            endTime: z.number().optional(),
        });

        const validation = paramsSchema.safeParse(params);

        if (!validation.success) {
            throw new ZenfuseValidationError('InvalidParams', validation.error);
        }
    }

    // TODO: safeValidateOrderParams()
}

module.exports = ExchangeBase;
