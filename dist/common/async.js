"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class PromiseAllError extends Error {
    constructor(errors) {
        super();
        this.errors = errors;
        this.message = errors.map(x => x.message).join('\n');
    }
}
function settledPromiseAll(promisesArray) {
    const errors = [];
    const allSettled = Promise.all(promisesArray.map((value) => {
        return Promise.resolve(value).catch(error => {
            errors.push(error);
        });
    }));
    return allSettled.then(resolvedPromises => {
        if (!lodash_1.isEmpty(errors)) {
            throw new PromiseAllError(errors);
        }
        return resolvedPromises;
    });
}
exports.settledPromiseAll = settledPromiseAll;
//# sourceMappingURL=async.js.map