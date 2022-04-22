export = OkxWebsocketBase;
declare class OkxWebsocketBase extends EventEmitter {
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
    /**
     * Opens websocket connection
     *
     * @param {string} path
     * @returns {Promise<void>}
     */
    open(path: string): Promise<void>;
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
}
import { EventEmitter } from "events";
