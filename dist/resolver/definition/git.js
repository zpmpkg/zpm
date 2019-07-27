"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const js_yaml_1 = require("js-yaml");
const git_1 = require("../../common/git");
const validation_1 = require("../../common/validation");
const definition_1 = require("./definition");
const validator_1 = require("./validator");
async function getGitPackageDefinition(pkg, gitVersion, parent) {
    const info = pkg.info;
    let content = {
        content: undefined,
    };
    try {
        content = await getGitContent(info.directories.definition, gitVersion);
    }
    catch (e) {
        //
        // @todo
    }
    content.content = validation_1.validateSchema(content.content || {}, undefined, {
        throw: true,
        origin: `package '${info.name}' definition on version '${gitVersion.name}'`,
        validator: validator_1.packageValiator,
    });
    if (pkg.package.manifest.packageValidator) {
        content.content = validation_1.validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${info.name}' definition on version '${gitVersion.name}'`,
            validator: pkg.package.manifest.packageValidator,
        });
    }
    if (!axioms_1.isDefined(content.content)) {
        throw new Error(`Could not find a matching schema for version '${gitVersion.name}'`);
    }
    return definition_1.fromPackageDefinition(content.content, pkg.info, pkg.package.manifest.registries, pkg.package.manifest.type, parent);
}
exports.getGitPackageDefinition = getGitPackageDefinition;
async function getGitContent(directory, gitVersion) {
    for (const prefix of ['.', '']) {
        for (const file of [`${prefix}zpm.json`, `${prefix}zpm.yml`]) {
            const fileContents = await git_1.catFile(directory, ['-p', `${gitVersion.hash}:${file}`]);
            if (axioms_1.isDefined(fileContents)) {
                const content = js_yaml_1.safeLoad(fileContents);
                return { content, path: file };
            }
        }
    }
    return { content: undefined };
}
exports.getGitContent = getGitContent;
//# sourceMappingURL=git.js.map