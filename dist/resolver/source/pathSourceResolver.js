"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath_1 = require("upath");
const util_1 = require("../../common/util");
// import { isDefined } from '~/common/util'
const sourceResolver_1 = require("./sourceResolver");
const pathDefinitionResolver_1 = require("../definition/pathDefinitionResolver");
const factory_1 = require("./factory");
class PathSourceResolver extends sourceResolver_1.SourceResolver {
    async load() {
        this.definitionResolver = new pathDefinitionResolver_1.PathDefinitionResolver(this);
        return true;
    }
    getName() {
        return `PATH:${this.package.entry.name}`;
    }
    getDefinitionPath() {
        let path = this.definition || this.repository;
        if (util_1.isDefined(this.package.options.absolutePath)) {
            path = upath_1.join(this.package.options.absolutePath, path);
        }
        if (this.package.options.root) {
            return upath_1.normalizeSafe(upath_1.join(this.package.options.root.source.getDefinitionPath(), path));
        }
        return path;
    }
    getRepositoryPath() {
        return this.repository;
    }
    isDefinitionSeparate() {
        return this.definition !== this.repository && this.definition !== undefined;
    }
    async getVersions() {
        return [];
    }
    getPath() {
        if (factory_1.isPathEntry(this.package.entry)) {
            if (this.package.options.root) {
                // @todo, check whether escaping sandbox
                const parentPath = this.package.options.root.source.getPath();
                if (parentPath !== '$ROOT') {
                    return upath_1.normalizeSafe(upath_1.join(parentPath, this.package.entry.path));
                }
                return upath_1.normalizeSafe(this.package.entry.path);
            }
            return this.package.entry.path;
        }
        else {
            throw new Error('not implemented');
        }
    }
}
exports.PathSourceResolver = PathSourceResolver;
//# sourceMappingURL=pathSourceResolver.js.map