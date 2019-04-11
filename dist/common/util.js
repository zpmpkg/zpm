"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha256_1 = require("js-sha256");
function shortHash(hash) {
    return shorten(js_sha256_1.sha256(hash));
}
exports.shortHash = shortHash;
function shorten(str) {
    return str.substring(0, 5);
}
exports.shorten = shorten;
function isDefined(value) {
    return value !== undefined && value !== null;
}
exports.isDefined = isDefined;
//# sourceMappingURL=util.js.map