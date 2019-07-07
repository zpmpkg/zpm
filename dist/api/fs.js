"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
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
    exists(file, where) {
        return fs_extra_1.default.pathExistsSync(upath_1.join(where === 'source' ? this.source : this.target, file));
    }
}
exports.FsApi = FsApi;
//# sourceMappingURL=fs.js.map