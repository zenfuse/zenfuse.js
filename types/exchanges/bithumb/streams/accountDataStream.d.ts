export = AccountDataStream;
declare class AccountDataStream extends BithumbWebsocketBase {
    /**
     *
     * @returns {this}
     */
    open(): this;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
}
import BithumbWebsocketBase = require("./websocketBase");
