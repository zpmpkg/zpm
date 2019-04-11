"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const git_1 = require("../../common/git");
const util_1 = require("../../common/util");
const validation_1 = require("../../common/validation");
const schemas_1 = require("../../schemas/schemas");
const definitionResolver_1 = require("./definitionResolver");
const packageDefinition_1 = require("./packageDefinition");
class GitDefinitionResolver extends definitionResolver_1.DefinitionResolver {
    constructor() {
        super(...arguments);
        this.validator = validation_1.buildSchema(schemas_1.packageV1);
    }
    async getPackageDefinition(hash) {
        const directory = this.getDefinitionPath();
        let content = {
            content: undefined,
        };
        try {
            content = await this.getContent(directory, hash);
        }
        catch (e) {
            //logger.info(e)
            // @todo
        }
        content.content = validation_1.validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${this.source.package.fullName}' definition on version '${hash}'`,
            validator: this.validator,
        });
        if (this.source.package.manifest.packageValidator) {
            content.content = validation_1.validateSchema(content.content || {}, undefined, {
                throw: true,
                origin: `package '${this.source.package.fullName}' definition on version '${hash}'`,
                validator: this.source.package.manifest.packageValidator,
            });
        }
        if (!util_1.isDefined(content.content)) {
            throw new Error(`Could not find a matching schema for version '${hash}'`);
        }
        return packageDefinition_1.fromPackageDefinition(content.content, content.path, this.source.package.options, this.source.package.manifest.registries, this.source.package.manifest.type);
    }
    getDefinitionPath() {
        return this.source.getDefinitionPath();
    }
    async getContent(directory, hash) {
        for (const prefix of ['.', '']) {
            for (const file of [`${prefix}package.json`, `${prefix}package.yml`]) {
                const fileContents = await git_1.catFile(directory, ['-p', `${hash}:${file}`]);
                if (util_1.isDefined(fileContents)) {
                    const content = js_yaml_1.safeLoad(fileContents);
                    return { content, path: file };
                }
            }
        }
        return { content: undefined };
    }
}
exports.GitDefinitionResolver = GitDefinitionResolver;
//# sourceMappingURL=gitDefinitionResolver.js.map