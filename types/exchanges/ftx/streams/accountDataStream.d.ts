export = AccountDataStream;
declare class AccountDataStream extends FtxWebsocketBase {
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
}
import FtxWebsocketBase = require("./websocketBase");
