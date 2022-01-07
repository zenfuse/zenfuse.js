const linkOriginalPayload = (object, originalPayload) => {
    Object.defineProperty(object, Symbol.for('zenfuse.originalPayload'), {
        value: originalPayload,
        enumerable: false,
        configurable: false,
        writable: false,
    });
};

module.exports = {
    linkOriginalPayload,
};
