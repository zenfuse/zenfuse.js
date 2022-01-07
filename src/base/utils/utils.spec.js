const utils = require('./utils');

describe('linkOriginalPayload()', () => {
    const { linkOriginalPayload } = utils;

    it('should link symbol', () => {
        const payload = { random: Math.random() };
        const object = {};

        linkOriginalPayload(object, payload);

        expect(object[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
        expect(object[Symbol.for('zenfuse.originalPayload')]).toBe(payload);
    });
});
