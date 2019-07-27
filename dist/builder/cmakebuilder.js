"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const fs_extra_1 = __importDefault(require("fs-extra"));
const handlebars_1 = __importDefault(require("handlebars"));
const upath_1 = require("upath");
const program_1 = require("../cli/program");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const packageBuilder_1 = require("./packageBuilder");
const lodash_1 = require("lodash");
class TargetCMakeBuilder extends packageBuilder_1.TargetBuilder {
    constructor() {
        super(...arguments);
        this.moduleMap = new Map();
        this.libraryPaths = [];
    }
    async run(target) {
        const { settings, self } = this.getTargetSettings(target);
        const mayAddPath = !self;
        if (settings && settings.template) {
            const templateFile = upath_1.join(this.version.package.info.directories.definition, 'templates', `${settings.template}.cmake`);
            await this.buildTemplate(target, templateFile);
        }
        else {
            if (this.ownDefinition(target)) {
                // we are likely to either define our own definition OR run it as a definition test
                return false;
            }
            const zpmMakeFile = upath_1.join(target.version.package.info.directories.definition, 'package.cmake');
            const CMakeFile = upath_1.join(target.version.package.info.directories.definition, 'CMakeLists.txt');
            const targetCMakeFile = upath_1.join(target.buildPath, 'CMakeLists.txt');
            if (fs_extra_1.default.existsSync(zpmMakeFile)) {
                await this.buildTemplate(target, zpmMakeFile);
            }
            else if (fs_extra_1.default.existsSync(CMakeFile) && targetCMakeFile !== CMakeFile) {
                fs_extra_1.default.copySync(CMakeFile, upath_1.join(target.buildPath, 'CMakeLists.txt'));
            }
        }
        if (mayAddPath) {
            this.libraryPaths.push(upath_1.relative(program_1.workingdir(), target.buildPath));
        }
        return true;
    }
    ownDefinition(target) {
        return (target.version.package.info.type === "PDPS" /* PDPS */ ||
            target.version.package.info.type === "PSSub" /* PSSub */);
    }
    async writeCmakeFile(target, content) {
        let file = upath_1.join(target.buildPath, 'CMakeLists.txt');
        if (this.seperateModule(target)) {
            const name = `${target.version.package.entry.path}.cmake`;
            file = upath_1.join(target.buildPath, name);
            if (!this.moduleMap.has(target.buildPath)) {
                this.moduleMap.set(target.buildPath, []);
            }
            this.moduleMap.get(target.buildPath).push(name);
        }
        await fs_extra_1.default.writeFile(file, content);
    }
    seperateModule(target) {
        return target.version.package.info.type === "GSSub" /* GSSub */;
    }
    async finish() {
        for (const [path, modules] of this.moduleMap) {
            const cmakeList = upath_1.join(path, 'CMakeLists.txt');
            if (fs_extra_1.default.pathExistsSync(cmakeList)) {
                throw new Error();
                // @todo
            }
            else {
                await fs_extra_1.default.writeFile(cmakeList, `
${lodash_1.uniq(modules)
                    .filter(p => io_1.isSubDirectory(p, environment_1.environment.directory.extract))
                    .map(p => `include("${p}")`)
                    .join('\n')}
                `);
            }
        }
        await fs_extra_1.default.writeFile(upath_1.join(environment_1.environment.directory.extract, 'ZPM'), `
set(CMAKE_MODULE_PATH "\${CMAKE_CURRENT_SOURCE_DIR}/extern/cmake")
include(ZPM)


project(Extern LANGUAGES CXX C)
${lodash_1.uniq(this.libraryPaths)
            .filter(p => io_1.isSubDirectory(p, environment_1.environment.directory.extract))
            .map(p => `add_subdirectory("${p}" "${p}")`)
            .join('\n')}
        `);
        await io_1.copy(['**/*.cmake', '!**/templates/*.cmake'], this.version.package.info.directories.definition, upath_1.join(environment_1.environment.directory.extract, 'cmake'));
        return true;
    }
    getTargetSettings(target) {
        let settings = axioms_1.get(this.versionLock.usedBy.find(f => f.versionId === target.version.id), [
            'settings',
        ]);
        let self = false;
        if (this.ownDefinition(target)) {
            if (settings && settings.self) {
                settings = settings.self;
                self = true;
            }
            else {
                return { settings: undefined, self: true };
            }
        }
        if (!axioms_1.isDefined(settings)) {
            return { settings: undefined, self };
        }
        for (const access of ['public', 'private']) {
            if (!settings[access]) {
                settings[access] = {};
            }
        }
        if (settings.include) {
            settings.public.include = [...(settings.public.include || []), ...settings.include];
            delete settings.include;
        }
        if (settings.define) {
            settings.public.define = [...(settings.public.define || []), ...settings.define];
            delete settings.define;
        }
        if (settings.link) {
            settings.public.link = [...(settings.public.link || []), ...settings.link];
            delete settings.link;
        }
        if (settings.feature) {
            settings.public.feature = [...(settings.public.feature || []), ...settings.feature];
            delete settings.feature;
        }
        return { settings: settings, self };
    }
    async buildTemplate(target, file) {
        const template = (await fs_extra_1.default.readFile(file)).toString();
        const view = await this.getTemplateView(target);
        if (view.custom) {
            view.custom = handlebars_1.default.compile(view.custom, { noEscape: true })(view);
        }
        const handlebarTemplate = handlebars_1.default.compile(template, { noEscape: true });
        const content = handlebarTemplate(view);
        await this.writeCmakeFile(target, content);
    }
    async getTemplateView(target) {
        const { settings } = this.getTargetSettings(target);
        const result = {
            public: {},
            private: {},
            globs: {},
            default: axioms_1.get(settings, ['default'], false),
            cmake: {
                project_name: '${PROJECT_NAME}',
            },
        };
        if (!settings) {
            return result;
        }
        if (!this.seperateModule(target)) {
            result.cmake = {
                ...result.cmake,
                project: 'zpm_project()',
                target: 'zpm_default_target(${PROJECT_NAME})',
            };
        }
        else {
            result.cmake = {
                ...result.cmake,
                project: `zpm_module("${target.version.package.entry.path}")`,
                target: 'zpm_alias(${PROJECT_NAME})' +
                    (result.default ? '\nzpm_default_target(${PROJECT_NAME})' : ''),
            };
        }
        for (const access of ['public', 'private']) {
            const settingsAccess = settings[access];
            const resultAccess = result[access];
            if (settingsAccess.include) {
                resultAccess.include = settingsAccess.include;
            }
            if (settingsAccess.define) {
                resultAccess.define = settingsAccess.define;
            }
            if (settingsAccess.link) {
                resultAccess.link = settingsAccess.link.map((f) => f.replace(':', '+').replace('/', '::'));
            }
            if (settingsAccess.feature) {
                resultAccess.compile = settingsAccess.feature;
            }
        }
        if (settings.source) {
            result.source = await io_1.glob(settings.source, target.buildPath, [], false);
        }
        if (settings.globs) {
            for (const key of Object.keys(settings.globs || {})) {
                result.globs[key] = await io_1.glob(settings.globs[key], target.buildPath, [], false);
            }
        }
        if (settings.custom) {
            result.custom = settings.custom;
        }
        return result;
    }
}
exports.TargetCMakeBuilder = TargetCMakeBuilder;
//# sourceMappingURL=cmakebuilder.js.map