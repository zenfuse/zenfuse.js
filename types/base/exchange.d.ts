export = ExchangeBase;
declare class ExchangeBase {
    /**
     * @param {BaseOptions} options
     */
    constructor(options?: BaseOptions);
    options: {
        /**
         * This object will be passed to `got.extend`
         */
        httpClientOptions: got.ExtendOptions;
        /**
         * Websocket client options based on `ws` lib with some extra parameters
         */
        wsClientOptions: any;
    };
    fetcher: any;
}
declare namespace ExchangeBase {
    export { ExtraWsOptions, BaseOptions };
}
import got = require("got");
type BaseOptions = {
    /**
     * This object will be passed to `got.extend`
     */
    httpClientOptions: import('got').ExtendOptions;
    /**
     * Websocket client options based on `ws` lib with some extra parameters
     */
    wsClientOptions: ExtraWsOptions & any;
};
type ExtraWsOptions = {
    /**
     * When specified, `prefixUrl` will be
     * prepended to websocket `url`.
     * **Note:** Path will be overwritten
     */
    prefixUrl: string;
};
