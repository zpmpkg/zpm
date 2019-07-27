"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IPackageVersion {
    constructor(pkg, id) {
        this._package = pkg;
        this.id = id;
    }
    get package() {
        return this._package;
    }
    getVersion() {
        return undefined;
    }
}
exports.IPackageVersion = IPackageVersion;
//# sourceMappingURL=ipackageVersion.js.map