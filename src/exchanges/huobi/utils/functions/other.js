const { createHmac } = require('crypto');

const createHmacSignature = (method, url, queryString, privateKey) => {
    const preSignedText = `${method}\napi.huobi.pro\n/${url}\n${queryString.toString()}`;

    return createHmac('sha256', privateKey)
        .update(preSignedText)
        .digest('base64');
};

module.exports = {
    createHmacSignature,
};
