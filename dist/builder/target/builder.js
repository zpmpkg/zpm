"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const fs_extra_1 = __importDefault(require("fs-extra"));
const mustache_1 = __importDefault(require("mustache"));
const upath_1 = require("upath");
const program_1 = require("../../cli/program");
const environment_1 = require("../../common/environment");
const io_1 = require("../../common/io");
const packageBuilder_1 = require("../packageBuilder");
class TargetBuilder extends packageBuilder_1.TargetBuilder {
    constructor() {
        super(...arguments);
        this.libraryPaths = [];
    }
    async run(target) {
        // console.log(
        //     target.getTargetPath(),
        //     target.package.source.definitionResolver.getDefinitionPath()
        const settings = this.getTargetSettings(target);
        // console.log(settings)
        if (settings.template) {
            const templateFile = upath_1.join(io_1.transformPath(this.package.source.definitionResolver.getDefinitionPath()), 'templates', `${settings.template}.cmake`);
            await this.buildTemplate(target, templateFile);
        }
        else {
            const zpmMakeFile = upath_1.join(target.package.source.definitionResolver.getDefinitionPath(), 'package.cmake');
            const CMakeFile = upath_1.join(target.package.source.definitionResolver.getDefinitionPath(), 'CMakeLists.txt');
            if (fs_extra_1.default.existsSync(zpmMakeFile)) {
                await this.buildTemplate(target, zpmMakeFile);
            }
            else if (fs_extra_1.default.existsSync(CMakeFile)) {
                await fs_extra_1.default.copySync(CMakeFile, upath_1.join(target.getTargetPath(), 'CMakeLists.txt'));
            }
        }
        this.libraryPaths.push(upath_1.relative(program_1.workingdir(), target.getTargetPath()));
        return true;
    }
    async finish() {
        await fs_extra_1.default.writeFile(upath_1.join(environment_1.environment.directory.extract, 'ZPM'), `
set(CMAKE_MODULE_PATH "\${CMAKE_CURRENT_SOURCE_DIR}/extern/cmake")
include(ZPM)


project(Extern LANGUAGES CXX C)
${this.libraryPaths
            .filter(p => io_1.isSubDirectory(p, environment_1.environment.directory.extract))
            .map(p => `add_subdirectory("${p}" "${p}")`)
            .join('\n')}
        `);
        await io_1.copy(['**/*.cmake'], io_1.transformPath(this.package.source.definitionResolver.getDefinitionPath()), upath_1.join(environment_1.environment.directory.extract, 'cmake'));
        return true;
    }
    getTargetSettings(target) {
        return axioms_1.get(this.lock.usage, ['settings', target.lock.id]) || {};
    }
    async buildTemplate(target, file) {
        const template = (await fs_extra_1.default.readFile(file)).toString();
        mustache_1.default.escape = value => value;
        const content = mustache_1.default.render(template, await this.getTemplateView(target));
        await fs_extra_1.default.writeFile(upath_1.join(target.getTargetPath(), 'CMakeLists.txt'), content);
    }
    async getTemplateView(target) {
        const result = {};
        const settings = this.getTargetSettings(target);
        if (settings.includes) {
            result.include = {
                files: settings.includes,
            };
        }
        if (settings.defines) {
            result.define = {
                definitions: settings.defines,
            };
        }
        if (settings.links) {
            result.link = {
                libraries: settings.links.map((f) => f.replace('/', '::')),
            };
        }
        if (settings.features) {
            result.compile = {
                features: settings.features,
            };
        }
        if (settings.custom) {
            result.custom = settings.custom;
        }
        return result;
    }
}
exports.TargetBuilder = TargetBuilder;
//# sourceMappingURL=builder.js.map