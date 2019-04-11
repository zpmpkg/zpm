"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("../common/git");
class GitApi {
    constructor(source, spinner) {
        this.source = source;
        this.spinner = spinner;
    }
    async checkout(hash) {
        return git_1.checkout(this.source, hash, { spinner: this.spinner });
    }
}
exports.GitApi = GitApi;
//# sourceMappingURL=git.js.map