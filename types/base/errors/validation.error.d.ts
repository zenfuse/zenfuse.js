export = ZenfuseValidationError;
declare class ZenfuseValidationError extends UserError {
    constructor(name: any, zodError: any);
    name: any;
    zodError: any;
    message: any;
}
import UserError = require("./user.error");
