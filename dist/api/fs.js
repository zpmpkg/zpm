"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const io_1 = require("../common/io");
class FsApi {
    constructor(source, target, spinner) {
        this.source = source;
        this.target = target;
        this.spinner = spinner;
    }
    async copy(sources, options) {
        if (!lodash_1.isEmpty(sources)) {
            await io_1.copy(sources, this.source, this.target);
        }
    }
}
exports.FsApi = FsApi;
//# sourceMappingURL=fs.js.map