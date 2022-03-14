export = ZenfuseValidationError;
declare class ZenfuseValidationError extends ZenfuseBaseError {
    constructor(name: any, zodError: any);
    name: any;
    zodError: any;
    message: any;
}
import ZenfuseBaseError = require("./base.error");
