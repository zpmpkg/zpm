"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IPackage {
    constructor(pkg) {
        this.package = pkg;
    }
    async load() {
        return true;
    }
    get entry() {
        return this.info.entry;
    }
    get id() {
        return this.info.id;
    }
    get type() {
        return this.info.type;
    }
    get info() {
        return this.package.info;
    }
}
exports.IPackage = IPackage;
//# sourceMappingURL=ipackage.js.map