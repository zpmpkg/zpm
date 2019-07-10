"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = require("lodash");
const lodash_2 = require("lodash");
const upath_1 = require("upath");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const util_1 = require("../common/util");
const packageBuilder_1 = require("./packageBuilder");
const builder_1 = require("./target/builder");
const extractor_1 = require("./target/extractor");
class Builder {
    constructor(registries, root, lockFile) {
        this.packages = [];
        this.builders = {};
        this.registries = registries;
        this.root = root;
        this.lockFile = lockFile;
        this.types = registries
            .getRegistries()
            .filter(r => !lodash_1.get(r, 'options.isBuildDefinition'))
            .map(r => r.name);
        this.builderTypes = registries
            .getRegistries()
            .filter(r => lodash_1.get(r, 'options.isBuildDefinition'))
            .map(r => r.name);
        // logger.info(lockFile)
    }
    async load() {
        for (const type of this.builderTypes) {
            await this.createBuilders(type, false);
        }
        for (const type of this.types) {
            await this.createBuilders(type, true);
        }
    }
    async build() {
        for await (const builder of this.builderTypes) {
            await async_1.settledPromiseAll(lodash_1.flatten(this.packages.map(async (pkg) => {
                await pkg.build(builder);
            })));
        }
        // only wrap up when we actually extracted packages
        if (await fs_extra_1.default.pathExists(environment_1.environment.directory.extract)) {
            await async_1.settledPromiseAll(lodash_2.map(this.builders, async (builder) => {
                if (builder.used) {
                    await builder.finish();
                }
            }));
            // automatically exlude from git to keep everyone happy :)
            await fs_extra_1.default.writeFile(upath_1.join(environment_1.environment.directory.extract, '.gitignore'), '*');
        }
    }
    async createBuilders(type, isPackage) {
        await async_1.settledPromiseAll((this.lockFile.named[type] || []).map(async (pkg) => {
            const found = await this.registries.search(type, {
                name: pkg.name,
            });
            if (util_1.isDefined(found)) {
                const builder = builderFactory(type, this, found, pkg, {
                    type: packageBuilder_1.PackageType.NAMED,
                });
                if (isPackage) {
                    this.packages.push(builder);
                }
                else {
                    this.builders[pkg.id] = builder;
                }
            }
            else {
                // @todo not implemented
            }
        }));
        await async_1.settledPromiseAll((this.lockFile.path[type] || []).map(async (pkg) => {
            if (pkg.name === '$ROOT' && !this.builderTypes.includes(type)) {
                // this.builders.push(new RootBuilder())
            }
            else {
                const found = await this.registries.search(type, {
                    name: pkg.name,
                    path: pkg.path,
                });
                if (util_1.isDefined(found)) {
                    const builder = builderFactory(type, this, found, pkg, {
                        type: packageBuilder_1.PackageType.PATH,
                    });
                    if (isPackage) {
                        this.packages.push(builder);
                    }
                    else {
                        this.builders[pkg.id] = builder;
                    }
                }
                else {
                    // @todo not implemented
                }
            }
        }));
    }
}
exports.Builder = Builder;
function builderFactory(type, builder, pkg, lock, options = {}) {
    if (type === 'extractor') {
        return new extractor_1.TargetExtractor(builder, pkg, lock, options);
    }
    else if (type === 'builder') {
        return new builder_1.TargetBuilder(builder, pkg, lock, options);
    }
    return new packageBuilder_1.PackageBuilder(builder, pkg, lock, options);
}
exports.builderFactory = builderFactory;
//# sourceMappingURL=builder.js.map