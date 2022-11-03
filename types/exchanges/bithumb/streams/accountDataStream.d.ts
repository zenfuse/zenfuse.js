export = AccountDataStream;
declare class AccountDataStream extends BitglobalWebsocketBase {
    /**
     *
     * @returns {this}
     */
    open(): this;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
}
import BitglobalWebsocketBase = require("./websocketBase");
