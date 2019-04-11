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
const io_1 = require("../../common/io");
class DefinitionResolver {
    constructor(source) {
        this.source = source;
    }
    getDefinitionPath() {
        return this.source.getDefinitionPath();
    }
    async loadFile(file) {
        let content;
        if (await fs.pathExists(file)) {
            content = await io_1.loadJsonOrYaml(file);
        }
        return content;
    }
}
exports.DefinitionResolver = DefinitionResolver;
//# sourceMappingURL=definitionResolver.js.map