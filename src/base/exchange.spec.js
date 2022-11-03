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

    describe('preciseOrderValues()', () => {
        it('should precise limit order parameters', () => {
            const testCases = [
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'limit',
                            side: 'buy',
                            price: 0.5208654921,
                            quantity: 100.256949345,
                        },
                        {
                            price: 1,
                            quantity: 0,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.5,
                        quantity: 100,
                    },
                },
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'limit',
                            side: 'buy',
                            price: 0.43523495873942,
                            quantity: 3.234511452346,
                        },
                        {
                            price: 7,
                            quantity: 4,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.4352349,
                        quantity: 3.2345,
                    },
                },
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'limit',
                            side: 'buy',
                            price: 0.0000011,
                            quantity: 0.000056,
                        },
                        {
                            price: 6,
                            quantity: 5,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.000001,
                        quantity: 0.00005,
                    },
                },
            ];

            for (const { args, expectation } of testCases) {
                expect(base.preciseOrderValues.call(base, ...args)).toEqual(
                    expectation,
                );
            }
        });
        it('should precise market order parameters', () => {
            const testCases = [
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'market',
                            side: 'buy',
                            quantity: 100.256949345,
                        },
                        {
                            price: 1,
                            quantity: 0,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'market',
                        side: 'buy',
                        quantity: 100,
                    },
                },
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'market',
                            side: 'sell',
                            quantity: 3.234511452346,
                        },
                        {
                            price: 7,
                            quantity: 4,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'market',
                        side: 'sell',
                        quantity: 3.2345,
                    },
                },
                {
                    args: [
                        {
                            symbol: 'ZEFU/USD',
                            type: 'market',
                            side: 'buy',
                            quantity: 0.000056,
                        },
                        {
                            price: 6,
                            quantity: 5,
                        },
                    ],
                    expectation: {
                        symbol: 'ZEFU/USD',
                        type: 'market',
                        side: 'buy',
                        quantity: 0.00005,
                    },
                },
            ];

            for (const { args, expectation } of testCases) {
                expect(base.preciseOrderValues.call(base, ...args)).toEqual(
                    expectation,
                );
            }
        });
        describe('error handling', () => {
            it('should throw error on impossible price precision', () => {
                const args = [
                    {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'sell',
                        price: 0.00000009,
                        quantity: 3.234511452346,
                    },
                    {
                        price: 7,
                        quantity: 4,
                    },
                ];

                expect(() =>
                    base.preciseOrderValues.call(base, ...args),
                ).toThrowError(
                    'Impossible to precise 9e-8 price. For ZEFU/USD, decimal precision of the price is 7 digits',
                );
            });
            it('should throw error on impossible quantity precision', () => {
                const args = [
                    {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'sell',
                        price: 845435.3452471717,
                        quantity: 0.234511452346,
                    },
                    {
                        price: 7,
                        quantity: 0,
                    },
                ];

                expect(() =>
                    base.preciseOrderValues.call(base, ...args),
                ).toThrowError(
                    'Impossible to precise 0.234511452346 quantity. For ZEFU/USD, decimal precision of the quantity is 0 digits',
                );
            });
            it('should throw error on both impossible cases', () => {
                const args = [
                    {
                        symbol: 'ZEFU/USD',
                        type: 'limit',
                        side: 'sell',
                        price: 0.000471717,
                        quantity: 0.234511452346,
                    },
                    {
                        price: 2,
                        quantity: 0,
                    },
                ];

                expect(() =>
                    base.preciseOrderValues.call(base, ...args),
                ).toThrowError(
                    'Impossible to precise 0.000471717 price and 0.234511452346 quantity. For ZEFU/USD, the decimal precision for quantity is 0 decimal digits and the decimal precision for price is 2 decimal digits',
                );
            });
        });
    });
});
