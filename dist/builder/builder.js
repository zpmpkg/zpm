"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = require("upath");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const util_1 = require("../common/util");
const cmakebuilder_1 = require("./cmakebuilder");
const extractor_1 = require("./extractor");
const packageBuilder_1 = require("./packageBuilder");
class Builder {
    constructor(registries, lock) {
        this.versions = new Map();
        this.builders = new Map();
        this.registries = registries;
        this.lock = lock;
        this.types = registries
            .getRegistries()
            .filter(r => !axioms_1.get(r, ['options', 'isBuildDefinition']))
            .map(r => r.name);
        this.builderTypes = registries
            .getRegistries()
            .filter(r => axioms_1.get(r, ['options', 'isBuildDefinition']))
            .map(r => r.name);
    }
    load() {
        for (const lock of this.lock.versions) {
            const found = this.registries.getVersion(lock.versionId);
            if (util_1.isDefined(found)) {
                const manifest = found.package.info.manifest;
                const builder = builderFactory(manifest, this, found, lock);
                if (!this.builderTypes.includes(manifest)) {
                    this.versions.set(found.id, builder);
                }
                else {
                    if (!this.builders.has(manifest)) {
                        this.builders.set(manifest, []);
                    }
                    this.builders.get(manifest).push(builder);
                }
            }
            else {
                // @todo not implemented
            }
        }
    }
    async build() {
        const groupedBuilders = this.builderTypes.map(b => this.builders.get(b) || []);
        for (const builders of groupedBuilders) {
            await async_1.settledPromiseAll(builders.map(b => b.initialize()));
        }
        for (const builders of groupedBuilders) {
            await async_1.settledPromiseAll(builders.map(b => b.build()));
        }
        // only wrap up when we actually extracted packages
        if (fs_extra_1.default.pathExistsSync(environment_1.environment.directory.extract)) {
            for (const builders of this.builders.values()) {
                for (const builder of builders) {
                    if (builder.used) {
                        await builder.finish();
                    }
                }
            }
            // automatically exlude from git to keep everyone happy :)
            await fs_extra_1.default.writeFile(upath_1.join(environment_1.environment.directory.extract, '.gitignore'), '*');
        }
        for (const packageBuilder of this.versions.values()) {
            packageBuilder.finish();
        }
    }
}
exports.Builder = Builder;
function builderFactory(type, builder, version, lock) {
    if (type === 'extractor') {
        return new extractor_1.TargetExtractor(builder, version, lock);
    }
    else if (type === 'builder') {
        return new cmakebuilder_1.TargetCMakeBuilder(builder, version, lock);
    }
    return new packageBuilder_1.PackageBuilder(builder, version, lock);
}
exports.builderFactory = builderFactory;
//# sourceMappingURL=builder.js.map