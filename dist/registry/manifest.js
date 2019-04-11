"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const async_1 = require("../common/async");
const io_1 = require("../common/io");
const logger_1 = require("../common/logger");
const util_1 = require("../common/util");
const validation_1 = require("../common/validation");
const package_1 = require("./package");
const factory_1 = require("../resolver/source/factory");
const schemas_1 = require("../schemas/schemas");
class Manifest {
    constructor(registries, type, options = {}) {
        this.entries = {};
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
                    await async_1.settledPromiseAll(contents.map(async (x) => {
                        // do not allow overriding of packages
                        let name;
                        if (factory_1.isNamedEntry(x)) {
                            name = x.name;
                        }
                        else if (factory_1.isPathEntry(x)) {
                            name = x.name || '$ROOT';
                        }
                        else {
                            // this one should not validate
                        }
                        if (!lodash_1.has(this.entries, name)) {
                            this.entries[name] = new package_1.Package(this, x, {
                                type: 1 /* Named */,
                            });
                        }
                    }));
                }
                catch (e) {
                    logger_1.logger.error(e);
                }
            }
        }));
        await this.add({ name: 'ZPM', path: './' }, { forceName: true, absolutePath: '$ZPM', type: 0 /* Path */ }).load();
    }
    add(entry, options) {
        let name;
        if (factory_1.isNamedEntry(entry)) {
            name = entry.name;
        }
        else if (factory_1.isPathEntry(entry)) {
            if (util_1.isDefined(options) && options.forceName) {
                name = entry.name;
            }
            else {
                name = `${entry.name}:${entry.path}`;
            }
        }
        else {
            throw new Error('Failed to determine package type');
        }
        if (!lodash_1.has(this.entries, name)) {
            this.entries[name] = new package_1.Package(this, entry, options);
        }
        return this.entries[name];
    }
    async loadFile(file) {
        return io_1.loadJsonOrYamlSimple(io_1.transformPath(file));
    }
}
exports.Manifest = Manifest;
//# sourceMappingURL=manifest.js.map