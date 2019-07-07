"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const fs = __importStar(require("fs-extra"));
const upath_1 = require("upath");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const logger_1 = require("../common/logger");
const validation_1 = require("../common/validation");
const entry_1 = require("../package/entry");
const info_1 = require("../package/info");
const package_1 = require("../package/package");
const schemas_1 = require("../schemas/schemas");
class Manifest {
    constructor(registries, type, options = {}) {
        this.entries = new Map();
        this.validator = validation_1.buildSchema(schemas_1.entriesV1);
        this.registries = registries;
        this.type = type;
        this.options = Object.assign({ isBuildDefinition: false }, options);
    }
    async load() {
        if (this.options.schema) {
            this.packageValidator = validation_1.buildSchema(await this.loadFile(this.options.schema));
        }
        await async_1.settledPromiseAll(this.registries.registries.map(async (registry) => {
            let file = upath_1.join(registry.directory, `${this.type}.json`);
            if (!(await fs.pathExists(file))) {
                file = upath_1.join(registry.directory, `${this.type}.yml`);
            }
            if (await fs.pathExists(file)) {
                const contents = await this.loadFile(file);
                try {
                    validation_1.validateSchema(contents, undefined, {
                        origin: `${file}`,
                        validator: this.validator,
                    });
                    for (const entry of contents.map(entry_1.transformToInternalEntry)) {
                        this.add(entry);
                    }
                }
                catch (e) {
                    logger_1.logger.error(e);
                }
            }
        }));
        this.add({
            path: './',
        }, {
            allowDevelopment: true,
            rootDirectory: environment_1.environment.directory.zpm,
            rootName: 'ZPM',
            alias: 'ZPM',
        });
    }
    add(entry, options) {
        const info = info_1.getPackageInfo(entry, this.type, options);
        const searchKey = info.name;
        let pkg = this.entries.get(searchKey);
        if (!axioms_1.isDefined(pkg)) {
            pkg = new package_1.Package(this, info);
            this.entries.set(searchKey, pkg);
        }
        if (info.alias && !this.entries.has(info.alias)) {
            this.entries.set(info.alias, pkg);
        }
        return pkg;
    }
    async loadFile(file) {
        return io_1.loadJsonOrYamlSimple(io_1.transformPath(file));
    }
}
exports.Manifest = Manifest;
//# sourceMappingURL=package.js.map