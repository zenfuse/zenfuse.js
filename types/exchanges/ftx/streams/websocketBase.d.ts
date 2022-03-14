export = FtxWebsocketBase;
declare class FtxWebsocketBase extends EventEmitter {
    static PING_INTERVAL: number;
    /**
     * @param {import('../wallets/spot')} baseInstance
     */
    constructor(baseInstance: import('../wallets/spot'));
    /**
     * @type {NodeJS.Timeout}
     */
    pingInterval: NodeJS.Timeout;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    base: import("../wallets/spot");
    /**
     * Opens websocket connection
     *
     * @returns {Promice<void>}
     */
    open(): Promice<void>;
    /**
     * @returns {this}
     */
    close(): this;
    handleConnectionError(err: any): void;
    checkSocketIsConneted(): void;
    get isSocketConneted(): boolean;
    /**
     * @param {object} msg
     * @returns {void}
     */
    sendSocketMessage(msg: object): void;
}
import { EventEmitter } from "events";
