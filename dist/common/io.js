"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs = __importStar(require("fs-extra"));
const js_yaml_1 = require("js-yaml");
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const upath_1 = require("upath");
const async_1 = require("./async");
const environment_1 = require("./environment");
async function loadJson(file) {
    const content = await fs.readFile(file);
    return JSON.parse(content.toString());
}
exports.loadJson = loadJson;
async function loadJsonOrYaml(file) {
    const content = await fs.readFile(file);
    if (file.endsWith('json')) {
        return JSON.parse(content.toString());
    }
    return js_yaml_1.safeLoadAll(content.toString());
}
exports.loadJsonOrYaml = loadJsonOrYaml;
async function loadJsonOrYamlSimple(file) {
    const content = await fs.readFile(file);
    if (file.endsWith('json')) {
        return JSON.parse(content.toString());
    }
    return js_yaml_1.safeLoad(content.toString());
}
exports.loadJsonOrYamlSimple = loadJsonOrYamlSimple;
async function writeJson(file, object) {
    await fs.writeFile(file, json_stable_stringify_1.default(object, { space: '  ' }));
    return true;
}
exports.writeJson = writeJson;
async function glob(source, root, excludes = []) {
    return lodash_1.filter((await fast_glob_1.default(source, {
        cwd: root,
        absolute: true,
        ignore: excludes,
    })).map(f => f.toString()), f => isSubDirectory(f, root));
}
exports.glob = glob;
async function copy(source, root, destination, excludes = [], options) {
    const files = await glob(source, root, excludes);
    await async_1.settledPromiseAll(files.map(async (file) => {
        await fs.copy(file, upath_1.join(destination, upath_1.relative(root, file)), {
            preserveTimestamps: true,
        });
        // console.log(file, join(destination, relative(root, file)))
    }));
}
exports.copy = copy;
function isSubDirectory(child, parent) {
    child = path_1.default.resolve(child);
    parent = path_1.default.resolve(parent);
    return upath_1.relative(child, parent).startsWith('..');
}
exports.isSubDirectory = isSubDirectory;
function transformPath(p) {
    return p
        .replace(/\$ROOT/g, environment_1.environment.directory.workingdir)
        .replace(/\$ZPM/g, environment_1.environment.directory.zpm)
        .replace(/\/\//g, '/');
}
exports.transformPath = transformPath;
//# sourceMappingURL=io.js.map