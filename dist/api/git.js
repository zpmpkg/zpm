"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("../package/repository");
class GitApi {
    constructor(source, spinner) {
        this.repository = repository_1.createRepository(source);
        this.spinner = spinner;
    }
    async checkout(hash) {
        return this.repository.checkout(hash, this.spinner);
    }
}
exports.GitApi = GitApi;
//# sourceMappingURL=git.js.map