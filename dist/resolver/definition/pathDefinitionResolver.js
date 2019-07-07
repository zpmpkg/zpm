"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:ordered-imports
const definitionResolver_1 = require("./definitionResolver");
class PathDefinitionResolver extends definitionResolver_1.DefinitionResolver {
    getDefinitionPath() {
        return this.source.getDefinitionPath();
    }
    mayUseDevelopmentPackages() {
        return this.source.package.options.isRoot === undefined
            ? false
            : this.source.package.options.isRoot;
    }
}
exports.PathDefinitionResolver = PathDefinitionResolver;
//# sourceMappingURL=pathDefinitionResolver.js.map