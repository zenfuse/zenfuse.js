export = FtxWebsocketBase;
declare class FtxWebsocketBase extends EventEmitter {
    static PING_INTERVAL: number;
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    /**
     * @type {NodeJS.Timeout}
     */
    pingInterval: NodeJS.Timeout;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    base: import("../base");
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
