import * as got from 'got';
import * as ws from 'ws';

import * as http from 'http';
import * as events from 'events';
import * as crypto from 'crypto';

declare interface WsClientOptions extends ws.ClientOptions {
    /**
     * When specified, `prefixUrl` will be prepended to websocket `url`.
     * **Note:** Path will be overwritten
     */
    prefixUrl: string;
}

declare interface ZenfuseOptions {
    httpClientOptions: got.ExtendOptions;
    wsClientOptions: WsClientOptions;
}

declare type credentials = {
    publicKey: string | crypto.KeyObject;
    secretKey: string | crypto.KeyObject;
    additionalKey?: string | crypto.KeyObject;
};

declare type Result<T extends {}> = T & {
    originalPayload: object;
};

declare type AccountBalances = Result<{}> &
    [
        {
            ticker: string;
            free: number;
            used: number;
        },
    ];

declare type kline = {
    open: string;
    high: string;
    low: string;
    close: string;
    timestamp: number;
    interval: string;
    isClosed?: boolean;
    symbol: string;
    volume: number;
};

declare type OrderParams = {
    symbol: string;
    quantity: number;
    price?: number;
    type: 'market' | 'limit';
    side: 'sell' | 'buy';
    [key: string]: any;
};

declare type PostedOrder = Result<OrderParams> & {
    timestamp: number;
    status: 'open' | 'closed' | 'canceled';
};

declare class ExchangeBase {
    static DEFAULT_OPTIONS: ZenfuseOptions;

    constructor(options: ZenfuseOptions);
}

declare interface ExchangeMainInterface {
    auth(creds: credentials): this;
    publicFetch(url: URL, options: http.RequestOptions): object;
    /**
     * Make authenticated http request based on constructor settings
     *
     * @param url
     * @param options Http request options
     * @returns Object form json payload
     */
    privateFetch(url: URL, options: http.RequestOptions): object;

    /**
     * Is instance has keys to authenticate on not
     */
    get hasKeys(): boolean;

    /**
     * Ping exchange servers
     */
    ping(): Promise<void>;

    /**
     * @returns Array of tickers in exchange
     */
    fetchTickers(): Promise<Result<string[]>>;

    /**
     * @returns Array of market pairs in exchange
     */
    fetchMarkets(): Promise<Result<string[]>>;

    fetchCandleHistory(params: {
        symbol: string;
        interval: string; // TODO: interval type
        startTime?: number;
        endTime?: number;
    }): Promise<Result<kline[]>>;

    /**
     * Fetch price symbol
     *
     * @param market Market symbol
     */
    fetchPrice(
        market?: string,
    ): Promise<Result<{ symbol: string; price: number }>>;

    /**
     * Post new spot order on Binance
     *
     * @param {OrderParams} params Order parameters
     * @returns {Promise}
     */
    postOrder(params: OrderParams): Promise<PostedOrder>;

    /**
     * Cancel an active order using symbol and id
     *
     * @param params Symbol and id of the order
     */
    cancelOrder(params: { symbol: string; id: string }): Promise<PostedOrder>;

    /**
     * Cancel an active order using only id
     *
     * @param orderId
     */
    cancelOrderById(orderId: string): Promise<PostedOrder>;

    fetchOpenOrders(): Promise<PostedOrder[]>; // TODO: fetchOpenOrders method

    // TODO: fetchOrder

    fetchOrderById(orderId: string): Promise<PostedOrder>;

    fetchBalances(): Promise<AccountBalances>;

    getAccountDataStream();
    getMarketDataStream(): MarketDataStream;
}

declare type WebSocketEvent = {
    channel: 'price' | 'candle';
    symbol: string;
    interval?: string;
};

declare class StreamBase extends events.EventEmitter {
    socket: ws.WebSocket;
    open(): this;
    close(): this;
    get isSocketConnected(): boolean;
}

declare class MarketDataStream extends StreamBase {
    constructor(baseInstance: ExchangeMainInterface);

    subscribeTo(event: WebSocketEvent): Promise<void>;
    unsubscribeFrom(event: WebSocketEvent): Promise<void>;
}

declare class AccountDataStream extends StreamBase {
    constructor(baseInstance: ExchangeMainInterface);

    on(event: 'orderUpdate', listener: (order: PostedOrder) => void);
}

declare module 'zenfuse' {}
