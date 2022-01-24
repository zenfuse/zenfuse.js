export = ZenfuseValidationError;
declare class ZenfuseValidationError extends ZenfuseBaseError {
    constructor(name: any, zodError: any);
    zodError: any;
}
import ZenfuseBaseError = require("./base.error");
