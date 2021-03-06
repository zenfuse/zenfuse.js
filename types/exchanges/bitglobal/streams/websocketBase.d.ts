export = BitglobalWebsocketBase;
declare class BitglobalWebsocketBase extends EventEmitter {
    static PING_INTERVAL: number;
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    /**
     * @type {number}
     */
    pingIntervalId: number;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    base: import("../base");
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
    transformBitglobalOrderWS(bOrder: any): import("../../../base/schemas/openOrder").PlacedOrder;
}
import { EventEmitter } from "events";
