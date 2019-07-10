"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_defined_1 = require("@zefiros/axioms/is-defined");
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const io_1 = require("../../common/io");
const range_1 = require("../../common/range");
const validation_1 = require("../../common/validation");
const schemas_1 = require("../../schemas/schemas");
const packageDefinition_1 = require("./packageDefinition");
const packageValiator = validation_1.buildSchema(schemas_1.packageV1);
async function getPathPackageDefinition(pkg) {
    const info = pkg.info;
    let content = {
        content: undefined,
    };
    try {
        content = await getContent(info.directories.definition);
    }
    catch (e) {
        //
    }
    content.content = validation_1.validateSchema(content.content || {}, undefined, {
        throw: true,
        origin: `package '${info.name}' definition on path '${content.path}'`,
        validator: packageValiator,
    });
    if (pkg.package.manifest.packageValidator) {
        content.content = validation_1.validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${info.name}' definition on path '${content.path}'`,
            validator: pkg.package.manifest.packageValidator,
        });
    }
    if (!is_defined_1.isDefined(content.content)) {
        throw new Error(`Could not find a matching schema`);
    }
    return packageDefinition_1.fromPackageDefinition(content.content, pkg.info, pkg.package.manifest.registries, pkg.package.manifest.type);
}
exports.getPathPackageDefinition = getPathPackageDefinition;
async function getContent(directory, version) {
    for (const prefix of ['.', '']) {
        const json = upath_1.join(directory, `${prefix}zpm.json`);
        const yml = upath_1.join(directory, `${prefix}zpm.yml`);
        let pth = directory;
        let content;
        if (await fs_extra_1.default.pathExists(json)) {
            content = (await loadFile(json));
            pth = json;
        }
        else if (await fs_extra_1.default.pathExists(yml)) {
            content = getYamlDefinition((await loadFile(yml)), version);
            pth = yml;
        }
        return { content, path: pth };
    }
    return { content: undefined, path: directory };
}
exports.getContent = getContent;
function getYamlDefinition(yml, version) {
    if (lodash_1.isArray(yml)) {
        if (isSingularYaml(yml) || !is_defined_1.isDefined(version)) {
            return yml[0];
        }
        const found = lodash_1.find(yml, (y) => {
            if (is_defined_1.isDefined(y.versions)) {
                return new range_1.VersionRange(y.versions).satisfies(version);
            }
            return false;
        });
        if (!found) {
            return undefined;
        }
        return getDefinition(found);
    }
    return getDefinition(yml);
}
exports.getYamlDefinition = getYamlDefinition;
async function loadFile(file) {
    let content;
    if (await fs_extra_1.default.pathExists(file)) {
        content = await io_1.loadJsonOrYaml(file);
    }
    return content;
}
exports.loadFile = loadFile;
function isSingularYaml(yml) {
    if (yml.length === 1) {
        return !(lodash_1.has(yml[0], 'versions') && lodash_1.has(yml[0], 'definition'));
    }
    return false;
}
exports.isSingularYaml = isSingularYaml;
function getDefinition(yml) {
    if (is_defined_1.isDefined(yml.versions)) {
        return yml.definition;
    }
    return yml;
}
exports.getDefinition = getDefinition;
//# sourceMappingURL=path.js.map