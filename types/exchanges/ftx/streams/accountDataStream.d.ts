export = AccountDataStream;
declare class AccountDataStream extends FtxWebsocketBase {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    /**
     *
     * @returns {this}
     */
    open(): this;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
}
import FtxWebsocketBase = require("./websocketBase");
