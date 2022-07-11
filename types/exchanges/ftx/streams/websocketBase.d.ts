export = FtxWebsocketBase;
declare class FtxWebsocketBase extends EventEmitter {
    static PING_INTERVAL: number;
    /**
     * @param {import('../wallets/spot')} baseInstance
     */
    constructor(baseInstance: import('../wallets/spot'));
    /**
     * @type {number}
     */
    pingIntervalId: number;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    base: import("../wallets/spot");
    signatureEncoding: string;
    /**
     * Opens websocket connection
     *
     * @returns {Promise<void>}
     */
    open(): Promise<void>;
    /**
     * @returns {this}
     */
    close(): this;
    handleConnectionError(err: any): void;
    checkSocketIsConnected(): void;
    get isSocketConnected(): boolean;
    /**
     * @param {object} msg
     * @returns {void}
     */
    sendSocketMessage(msg: object): void;
    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    transformFtxOrder(fOrder: any): import("../../../base/schemas/openOrder").PlacedOrder;
}
import { EventEmitter } from "events";
