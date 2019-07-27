"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class PackageVersion {
    constructor(impl) {
        this.definition = undefined;
        this.dependsOn = [];
        this.impl = impl;
        this.usedBy = {};
        this.expanded = false;
    }
    get id() {
        return this.impl.id;
    }
    get package() {
        return this.impl.package;
    }
    get cost() {
        return this.impl.getCost();
    }
    get version() {
        return this.impl.getVersion();
    }
    get entry() {
        return this.package.entry;
    }
    get targetPath() {
        return this.impl.getTargetPath();
    }
    get buildPath() {
        return this.impl.getBuildPath();
    }
    async getDefinition(parent) {
        if (lodash_1.isUndefined(this.definition)) {
            this.definition = await this.impl.getDefinition(parent);
        }
        return this.definition;
    }
    addUsage(usage) {
        return this.impl.addUsage(usage);
    }
}
exports.PackageVersion = PackageVersion;
//# sourceMappingURL=packageVersion.js.map