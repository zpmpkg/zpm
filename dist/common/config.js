"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const lodash_1 = require("lodash");
const upath_1 = __importStar(require("upath"));
const environment_1 = require("./environment");
const validation_1 = require("./validation");
const schemas_1 = require("../schemas/schemas");
class Configuration {
    constructor() {
        this.names = ['config.yml', 'config.yaml', 'config.json'];
        this.loaded = [];
        this.validator = validation_1.buildSchema(schemas_1.configurationV1);
    }
    load() {
        this.loadOverrideFile(upath_1.default.join(__dirname, '../../'));
        this.loadOverrideFile(environment_1.environment.directory.configuration);
    }
    loadOverrideFile(directory) {
        this.names.forEach(n => {
            this.storeFileContent(`${directory}/${n}`);
            this.storeFileContent(`${directory}/.${n}`);
        });
    }
    storeFileContent(file) {
        const abs = upath_1.normalize(file);
        if (fs_1.existsSync(file) && !this.loaded.includes(abs)) {
            this.values = lodash_1.merge(this.values || {}, this.loadFile(abs));
            this.loaded.push(abs);
            try {
                this.values = validation_1.validateSchema(this.values, undefined, {
                    origin: `while loading ${file} - skipping instead`,
                    validator: this.validator,
                });
            }
            catch (error) {
                // pass
            }
        }
    }
    loadFile(file) {
        const content = fs_1.readFileSync(file).toString();
        if (file.endsWith('json')) {
            return JSON.parse(content);
        }
        return js_yaml_1.safeLoad(content);
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=config.js.map