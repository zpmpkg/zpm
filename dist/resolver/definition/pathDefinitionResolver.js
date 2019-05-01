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
const io_1 = require("../../common/io");
const logger_1 = require("../../common/logger");
const range_1 = require("../../common/range");
const util_1 = require("../../common/util");
const validation_1 = require("../../common/validation");
const schemas_1 = require("../../schemas/schemas");
const definitionResolver_1 = require("./definitionResolver");
const packageDefinition_1 = require("./packageDefinition");
class PathDefinitionResolver extends definitionResolver_1.DefinitionResolver {
    constructor() {
        super(...arguments);
        this.validator = validation_1.buildSchema(schemas_1.packageV1);
    }
    async getPackageDefinition(version) {
        const directory = this.getDefinitionPath();
        let content = {
            content: undefined,
        };
        try {
            content = await this.getContent(directory, version);
        }
        catch (e) {
            //
        }
        content.content = validation_1.validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${this.source.package.fullName}' definition on path '${content.path}'`,
            validator: this.validator,
        });
        if (this.source.package.manifest.packageValidator) {
            content.content = validation_1.validateSchema(content.content || {}, undefined, {
                throw: true,
                origin: `package '${this.source.package.fullName}' definition on path '${content.path}'`,
                validator: this.source.package.manifest.packageValidator,
            });
        }
        if (!util_1.isDefined(content.content)) {
            throw new Error(`Could not find a matching schema for version '${version}'`);
        }
        return packageDefinition_1.fromPackageDefinition(content.content, content.path, this.source.package.options, this.source.package.manifest.registries, this.source.package.manifest.type);
    }
    getDefinitionPath() {
        return this.source.getDefinitionPath();
    }
    mayUseDevelopmentPackages() {
        return this.source.package.options.isRoot === undefined
            ? false
            : this.source.package.options.isRoot;
    }
    async getContent(directory, version) {
        logger_1.logger.logfile.info(`Trying to read '${this.source.package.fullName}' from '${directory}`);
        for (const prefix of ['.', '']) {
            const json = io_1.transformPath(upath_1.join(directory, `${prefix}zpm.json`));
            const yml = io_1.transformPath(upath_1.join(directory, `${prefix}zpm.yml`));
            let pth = directory;
            let content;
            if (await fs.pathExists(json)) {
                content = (await this.loadFile(json));
                pth = json;
            }
            else if (await fs.pathExists(yml)) {
                content = this.getYamlDefinition((await this.loadFile(yml)), version);
                pth = yml;
            }
            return { content, path: pth };
        }
        return { content: undefined, path: directory };
    }
    getYamlDefinition(yml, version) {
        if (lodash_1.isArray(yml)) {
            if (this.isSingularYaml(yml)) {
                return yml[0];
            }
            const found = lodash_1.find(yml, (y) => {
                if (util_1.isDefined(y.versions)) {
                    return new range_1.VersionRange(y.versions).satisfies(version);
                }
                return false;
            });
            if (!found) {
                return undefined;
            }
            return this.getDefinition(found);
        }
        return this.getDefinition(yml);
    }
    isSingularYaml(yml) {
        if (yml.length === 1) {
            return !(lodash_1.has(yml[0], 'versions') && lodash_1.has(yml[0], 'definition'));
        }
        return false;
    }
    getDefinition(yml) {
        if (util_1.isDefined(yml.versions)) {
            return yml.definition;
        }
        return yml;
    }
}
exports.PathDefinitionResolver = PathDefinitionResolver;
//# sourceMappingURL=pathDefinitionResolver.js.map