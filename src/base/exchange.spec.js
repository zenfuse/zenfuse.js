const ExchangeBase = require('./exchange');
const ZenfuseValidationError = require('./errors/validation.error');

const base = new ExchangeBase();

describe('ExchangeBase', () => {
    describe('validateOrderParams()', () => {
        it('should do not throw error on valid orders', () => {
            const validLimitOrder = {
                symbol: 'ZEFU/USD',
                type: 'limit',
                side: 'buy',
                quantity: 20,
                price: 0.5,
            };

            expect(
                base.validateOrderParams.bind(base, validLimitOrder),
            ).not.toThrowError();

            const validMarketOrder = {
                symbol: 'ZEFU/USDC',
                type: 'market',
                side: 'sell',
                quantity: 2222,
            };

            expect(
                base.validateOrderParams.bind(base, validMarketOrder),
            ).not.toThrowError();
        });

        it('should throw error on invalid type', () => {
            const invalidOrders = [
                {},
                {
                    symbol: Symbol('ZEFU/USDC'),
                    type: 'market',
                    side: 'sell',
                    quantity: 1337,
                },
                {
                    symbol: 'ZEFU/USDC',
                    type: 'stop-loss',
                    side: 'buy',
                    quantity: 1337,
                },
                {
                    symbol: 'ZEFU/USDC',
                    type: 'market',
                    side: 'dog',
                    quantity: 1337,
                },
                {
                    symbol: 'ZEFU/USDC',
                    type: 'market',
                    side: 'sell',
                    quantity: 'many',
                },
            ];

            for (const invalidOrder of invalidOrders) {
                expect(
                    base.validateOrderParams.bind(base, invalidOrder),
                ).toThrowError(ZenfuseValidationError);
            }
        });

        it('should throw error if price undefined on limit order', () => {
            const invalidOrder = {
                symbol: 'ZEFU/USD',
                type: 'limit',
                side: 'buy',
                quantity: 20,
            };

            expect(
                base.validateOrderParams.bind(base, invalidOrder),
            ).toThrowError(ZenfuseValidationError);
        });

        it('should throw error on invalid separator', () => {
            const invalidOrders = [
                {
                    symbol: 'ZEFU#USD',
                    type: 'limit',
                    side: 'buy',
                    quantity: 20,
                    price: 0.5,
                },
                {
                    symbol: 'ZEFU//USD',
                    type: 'limit',
                    side: 'buy',
                    quantity: 20,
                    price: 0.5,
                },
                {
                    symbol: 'Z/E/F/U/U/S/D',
                    type: 'limit',
                    side: 'buy',
                    quantity: 20,
                    price: 0.5,
                },
            ];

            for (const invalidOrder of invalidOrders) {
                expect(
                    base.validateOrderParams.bind(base, invalidOrder),
                ).toThrowError(ZenfuseValidationError);
            }
        });
    });
});
