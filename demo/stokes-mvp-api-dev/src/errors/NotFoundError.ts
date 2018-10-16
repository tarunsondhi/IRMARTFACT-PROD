export class NotFoundError extends Error {
    readonly name: string = 'NotFoundError';

    constructor(...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError);
        }
    }
}