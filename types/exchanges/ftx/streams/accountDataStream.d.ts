export = AccountDataStream;
declare class AccountDataStream extends FtxWebsocketBase {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    /**
     *
     * @returns {Promise<this>}
     */
    open(): Promise<AccountDataStream>;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
}
import FtxWebsocketBase = require("./websocketBase");
