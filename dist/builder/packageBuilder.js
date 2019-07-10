"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath_1 = require("upath");
const environment_1 = require("../common/environment");
const lock_1 = require("./lock");
class BasePackageBuilder {
    constructor(builder, pkg, lock, options = {}) {
        this.used = false;
        this.builder = builder;
        this.package = pkg;
        this.lock = lock;
        this.options = {
            type: PackageType.PATH,
            ...options,
        };
    }
    async build(type) {
        if (this.lock.usage && this.lock.usage.required && this.lock.usage.required[type]) {
            const locked = this.lock.usage.required[type];
            if (this.builder.builders[locked]) {
                this.builder.builders[locked].used = true;
                return this.builder.builders[locked].run(this);
            }
        }
        return false;
    }
    getTargetPath() {
        return upath_1.join(environment_1.environment.directory.extract, this.package.manifest.type, this.package.vendor, this.package.name);
    }
    getHash() {
        return lock_1.isNamedLock(this.lock) ? this.lock.hash : undefined;
    }
}
exports.BasePackageBuilder = BasePackageBuilder;
class PackageBuilder extends BasePackageBuilder {
    async run(target) {
        return true;
    }
    async finish() {
        return true;
    }
}
exports.PackageBuilder = PackageBuilder;
//# sourceMappingURL=packageBuilder.js.map