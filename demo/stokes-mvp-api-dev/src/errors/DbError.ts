export class DbError extends Error {
    readonly name: string = 'DbError';

    constructor(...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DbError);
        }
    }
}