export = AccountDataStream;
declare class AccountDataStream extends OkxWebsocketBase {
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
import OkxWebsocketBase = require("./websocketBase");
