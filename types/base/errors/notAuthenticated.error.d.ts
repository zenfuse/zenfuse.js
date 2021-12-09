export = NotAuthenticatedError;
declare class NotAuthenticatedError extends BaseConnectorError {
    constructor();
}
import BaseConnectorError = require("./base.error");
