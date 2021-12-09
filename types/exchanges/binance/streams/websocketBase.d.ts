export = ExchangeWebsocketBase;
declare class ExchangeWebsocketBase extends EventEmitter {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    base: import("../base");
    getSocketConnection(path: any): Promise<any>;
    handleConnectionError(err: any): void;
}
import { EventEmitter } from "events";
