const got = require('got');
const mergeObjects = require('deepmerge');
const z = require('zod');

const Configurator = require('./conf/configurator');
const pkg = require('../../package.json');
const ValidationError = require('./errors/validation.error');
const UserError = require('./errors/user.error');
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
            agent: {
                https: null,
            },
        },
        wsClientOptions: {
            headers: {
                'user-agent': userAgent,
            },
            agent: null,
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

        if (Configurator.has('httpsAgent')) {
            const customAgent = Configurator.get('httpsAgent');
            this.options.httpClientOptions.agent.https = customAgent;
            this.options.wsClientOptions.agent = customAgent;
        }

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

        throw new ValidationError('InvalidOrder', result.error);
    }

    // TODO: safeValidateOrderParams()

    validateCandleHistoryParams(params) {
        const paramsSchema = z.object({
            symbol: KlineSchema.shape.symbol,
            interval: KlineSchema.shape.interval,
            startTime: z.number().optional(),
            endTime: z.number().optional(),
        });

        const validation = paramsSchema.safeParse(params);

        if (!validation.success) {
            throw new ValidationError('InvalidParams', validation.error);
        }
    }

    /**
     * @typedef {import('./schemas/orderParams').ZenfuseOrderParams} ZenfuseOrderParams
     */

    /**
     * Preciser for basic order values. Exists for provide same precisions for any exchanges without context.
     *
     * @protected
     * @param {ZenfuseOrderParams} zOrder
     * @param {object} limits Decimal precisions
     * @param {number} limits.price
     * @param {number} limits.quantity
     * @returns {ZenfuseOrderParams} Order parameters with precised price and quantity
     */
    preciseOrderValues(zOrder, limits) {
        /**
         * @see http://www.jacklmoore.com/notes/rounding-in-javascript/
         * @param {number} value
         * @param {number} limit
         * @returns {number} Precised number
         */
        const precise = (value, limit) => {
            return Number(Math.floor(value + 'e' + limit) + 'e-' + limit);
        };

        const precised = {
            quantity: precise(zOrder.quantity, limits.quantity),
        };

        const isLimitOrder = zOrder.type === 'limit';

        if (isLimitOrder) {
            precised.price = precise(zOrder.price, limits.price);
        }

        const isPriceInvalid =
            (precised.price === 0 || isNaN(precised.price)) && isLimitOrder;

        const isQuantityInvalid =
            precised.quantity === 0 || isNaN(precised.quantity);

        if (isPriceInvalid || isQuantityInvalid) {
            const err = new UserError(null, 'PRECISION_IMPOSSIBLE');

            // Catch all cases just for fun
            if (isPriceInvalid && isQuantityInvalid) {
                err.message = `Impossible to precise ${zOrder.price} price and ${zOrder.quantity} quantity. For ${zOrder.symbol}, the decimal precision for quantity is ${limits.quantity} decimal digits and the decimal precision for price is ${limits.price} decimal digits`;
            }
            if (!isPriceInvalid && isQuantityInvalid) {
                err.message = `Impossible to precise ${zOrder.quantity} quantity. For ${zOrder.symbol}, decimal precision of the quantity is ${limits.quantity} digits`;
            }
            if (isPriceInvalid && !isQuantityInvalid) {
                err.message = `Impossible to precise ${zOrder.price} price. For ${zOrder.symbol}, decimal precision of the price is ${limits.price} digits`;
            }

            throw err;
        }

        return Object.assign(zOrder, precised);
    }
}

module.exports = ExchangeBase;
