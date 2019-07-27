"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const internal_1 = require("./internal");
class Package {
    constructor(manifest, info) {
        this.versions = undefined;
        this.loaded = false;
        this.manifest = manifest;
        this.info = info;
        this.impl = this.createPackageType();
    }
    createPackageType() {
        switch (this.info.type) {
            case "PDPS" /* PDPS */:
                return new internal_1.PDPSPackage(this);
            case "PDGS" /* PDGS */:
                return new internal_1.PDGSPackage(this);
            // case PackageType.GDPS:
            //     return new GDPSPackage(this)
            case "PSSub" /* PSSub */:
                return new internal_1.PSSubPackage(this);
            case "GSSub" /* GSSub */:
                return new internal_1.GSSubPackage(this);
            case "GDGS" /* GDGS */:
                return new internal_1.GDGSPackage(this);
            default:
                throw new Error(`${this.info.type} not implemented`);
        }
    }
    async load() {
        if (!this.loaded) {
            this.loaded = await this.impl.load();
        }
        return this.loaded;
    }
    async getVersions() {
        if (util_1.isUndefined(this.versions)) {
            await this.impl.load();
            this.versions = (await this.impl.getVersions()).map(v => {
                const version = new internal_1.PackageVersion(v);
                v.version = version;
                return version;
            });
        }
        return this.versions;
    }
    get id() {
        return this.info.id;
    }
}
exports.Package = Package;
//# sourceMappingURL=package.js.map