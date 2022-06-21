export function linkOriginalPayload(object: any, originalPayload: any): void;
export function timeIntervalToSeconds(interval: any): any;
export function createHmacSignatureDefault({ ts, method, path, body }: {
    ts: any;
    method: any;
    path: any;
    body?: string;
}, key: any, encoding: any): string;
/**
 * Pipe function implementation from ramda
 *
 * @param  {...Function} fns List of functions to pipe
 * @returns {Function}
 */
export function pipe(...fns: Function[]): Function;
