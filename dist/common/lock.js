"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
class AwaitLock {
    constructor() {
        this.acquired = false;
        this.waitingResolvers = [];
    }
    acquire() {
        if (!this.acquired) {
            this.acquired = true;
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this.waitingResolvers.push(resolve);
        });
    }
    release() {
        assert_1.default(this.acquired, 'Trying to release an unacquired lock');
        if (this.waitingResolvers.length > 0) {
            const resolve = this.waitingResolvers.shift();
            resolve();
        }
        else {
            this.acquired = false;
        }
    }
    async withLock(fn) {
        await this.acquire();
        let out;
        try {
            out = await fn();
        }
        catch (e) {
            this.release();
            throw e;
        }
        this.release();
        return out;
    }
}
exports.default = AwaitLock;
//# sourceMappingURL=lock.js.map