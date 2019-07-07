"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const logger_1 = require("../common/logger");
const path_1 = require("../resolver/definition/path");
const version_1 = require("../common/version");
class IPackage {
    constructor(pkg) {
        this.package = pkg;
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
class Package {
    constructor(manifest, info) {
        this.versions = undefined;
        this.manifest = manifest;
        this.info = info;
        this.impl = this.createPackageType();
    }
    createPackageType() {
        switch (this.info.type) {
            case "PDPS" /* PDPS */:
                return new PDPSPackage(this);
            default:
                return new PDPSPackage(this);
        }
    }
    async load() { }
    async getVersions() {
        if (util_1.isUndefined(this.versions)) {
            this.versions = (await this.impl.getVersions()).map(v => new PackageVersion(v));
        }
        return this.versions;
    }
    get id() {
        return this.info.id;
    }
}
exports.Package = Package;
class IPackageVersion {
    constructor(id) {
        this.id = id;
    }
}
exports.IPackageVersion = IPackageVersion;
class PackageVersion {
    constructor(impl) {
        this.definition = undefined;
        this.impl = impl;
    }
    get id() {
        return this.impl.id;
    }
    get cost() {
        return this.impl.getCost();
    }
    async getDefinition() {
        if (util_1.isUndefined(this.definition)) {
            this.definition = await this.impl.getDefinition();
        }
        return this.definition;
    }
}
exports.PackageVersion = PackageVersion;
class PDPSPackageVersion extends IPackageVersion {
    constructor(pkg, id) {
        super(id);
        this.package = pkg;
    }
    async getDefinition() {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.entry.path}' from '${this.package.info.directories.definition}`);
        return path_1.getPathPackageDefinition(this.package);
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
}
exports.PDPSPackageVersion = PDPSPackageVersion;
class PDPSPackage extends IPackage {
    async getVersions() {
        return [new PDPSPackageVersion(this, this.id)];
    }
    get info() {
        return this.package.info;
    }
}
exports.PDPSPackage = PDPSPackage;
//# sourceMappingURL=package.js.map