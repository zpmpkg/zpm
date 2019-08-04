import { get, isDefined } from '@zefiros/axioms'
import fs from 'fs-extra'
import Handlebars from 'handlebars'
import { uniq } from 'lodash'
import path, { join, relative } from 'upath'
import { workingdir } from '~/cli/program'
import { environment } from '~/common/environment'
import { copy, glob, isSubDirectory } from '~/common/io'
import { InternalGSSubEntry } from '~/package/entry'
import { PackageType } from '~/package/type'
import { PackageBuilder, TargetBuilder } from './packageBuilder'

interface TemplateCondition {
    on: string
    let: {
        include?: string[]
        source?: string[]
        define?: string[]
        link?: string[]
        feature?: string[]
        option?: string[]
        custom?: string
    }
    otherwise?: {
        include?: string[]
        source?: string[]
        define?: string[]
        link?: string[]
        feature?: string[]
        option?: string[]
        custom?: string
    }
}

interface TemplateAccessview {
    include?: string[]
    define?: string[]
    link?: string[]
    feature?: string[]
    option?: string[]
    conditions?: TemplateCondition[]
}

interface TemplateView {
    public: TemplateAccessview
    private: TemplateAccessview
    source?: string[]
    custom?: string
    globs: {
        [k: string]: string[]
    }
    default: boolean
    cmake: {
        project_name: string
        dir: string
        target?: string
        project?: string
    }
}

interface TemplateSettingsCondition {
    on: string
    let: {
        include?: string[]
        source?: string[]
        define?: string[]
        link?: string[]
        feature?: string[]
        option?: string[]
        custom?: string
    }
    otherwise?: {
        include?: string[]
        source?: string[]
        define?: string[]
        link?: string[]
        feature?: string[]
        option?: string[]
        custom?: string
    }
}
interface TemplateSettingsAccessView {
    include?: string[]
    define?: string[]
    link?: string[]
    feature?: string[]
    option?: string[]
    conditions?: TemplateSettingsCondition[]
}

interface TemplateSettings {
    public: TemplateSettingsAccessView
    private: TemplateSettingsAccessView
    source?: string[]
    custom?: string
    template?: string
    globs?: {
        [k: string]: string[]
    }
    default?: boolean
    self?: Omit<TemplateSettings, 'self'>
}

export class TargetCMakeBuilder extends TargetBuilder {
    private moduleMap: Map<string, string[]> = new Map()
    private libraryPaths: string[] = []
    public async run(target: PackageBuilder): Promise<boolean> {
        const { settings, self } = this.getTargetSettings(target)
        const mayAddPath = !self

        if (settings && settings.template) {
            const templateFile = join(
                this.version.package.info.directories.definition,
                'templates',
                `${settings.template}.cmake`
            )
            await this.buildTemplate(target, templateFile)
        } else {
            if (this.ownDefinition(target)) {
                // we are likely to either define our own definition OR run it as a definition test
                return false
            }

            const zpmMakeFile = join(
                target.version.package.info.directories.definition,
                'package.cmake'
            )
            const CMakeFile = join(
                target.version.package.info.directories.definition,
                'CMakeLists.txt'
            )
            const targetCMakeFile = join(target.buildPath, 'CMakeLists.txt')

            if (fs.existsSync(zpmMakeFile)) {
                await this.buildTemplate(target, zpmMakeFile)
            } else if (fs.existsSync(CMakeFile) && targetCMakeFile !== CMakeFile) {
                fs.copySync(CMakeFile, join(target.buildPath, 'CMakeLists.txt'))
            }
        }
        if (mayAddPath) {
            this.libraryPaths.push(relative(workingdir(), target.buildPath))
        }
        return true
    }

    public ownDefinition(target: PackageBuilder) {
        return (
            target.version.package.info.type === PackageType.PDPS ||
            target.version.package.info.type === PackageType.PSSub
        )
    }

    public async writeCmakeFile(target: PackageBuilder, content: string) {
        let file = join(target.buildPath, 'CMakeLists.txt')
        if (this.seperateModule(target)) {
            const name = `${(target.version.package.entry as InternalGSSubEntry).path}.cmake`
            file = join(target.buildPath, name)
            if (!this.moduleMap.has(target.buildPath)) {
                this.moduleMap.set(target.buildPath, [])
            }
            this.moduleMap.get(target.buildPath)!.push(name)
        }
        await fs.writeFile(file, content)
    }

    public seperateModule(target: PackageBuilder) {
        return target.version.package.info.type === PackageType.GSSub
    }

    public async finish(): Promise<boolean> {
        for (const [path, modules] of this.moduleMap) {
            const cmakeList = join(path, 'CMakeLists.txt')
            if (fs.pathExistsSync(cmakeList)) {
                throw new Error()
                // @todo
            } else {
                await fs.writeFile(
                    cmakeList,
                    `
${uniq(modules)
    .filter(p => isSubDirectory(p, environment.directory.extract))
    .map(p => `include("${p}")`)
    .join('\n')}
                `
                )
            }
        }

        await fs.writeFile(
            join(environment.directory.extract, 'ZPM'),
            `
set(CMAKE_MODULE_PATH "\${CMAKE_CURRENT_SOURCE_DIR}/extern/cmake")
include(ZPM)


project(Extern LANGUAGES CXX C)
${uniq(this.libraryPaths)
    .filter(p => isSubDirectory(p, environment.directory.extract))
    .map(p => `add_subdirectory("${p}" "${p}")`)
    .join('\n')}
        `
        )
        await copy(
            ['**/*.cmake', '!**/templates/*.cmake'],
            this.version.package.info.directories.definition,
            join(environment.directory.extract, 'cmake')
        )

        return true
    }

    private getTargetSettings(
        target: PackageBuilder
    ): { settings: TemplateSettings | undefined; self: boolean } {
        let settings = get(this.versionLock.usedBy.find(f => f.versionId === target.version.id), [
            'settings',
        ])
        let self = false

        if (this.ownDefinition(target)) {
            if (settings && settings.self) {
                settings = settings.self
                self = true
            } else {
                return { settings: undefined, self: true }
            }
        }
        if (!isDefined(settings)) {
            return { settings: undefined, self }
        }

        for (const access of ['public', 'private']) {
            if (!settings[access]) {
                settings[access] = {}
            }
        }
        if (settings.include) {
            settings.public.include = [...(settings.public.include || []), ...settings.include]
            delete settings.include
        }
        if (settings.define) {
            settings.public.define = [...(settings.public.define || []), ...settings.define]
            delete settings.define
        }
        if (settings.link) {
            settings.public.link = [...(settings.public.link || []), ...settings.link]
            delete settings.link
        }
        if (settings.feature) {
            settings.public.feature = [...(settings.public.feature || []), ...settings.feature]
            delete settings.feature
        }
        if (settings.conditions) {
            settings.public.conditions = [
                ...(settings.public.conditions || []),
                ...settings.conditions,
            ]
            delete settings.conditions
        }

        return { settings: settings as TemplateSettings, self }
    }

    private async buildTemplate(target: PackageBuilder, file: string) {
        const template = (await fs.readFile(file)).toString()
        const view = await this.getTemplateView(target)
        view.public.conditions = view.public.conditions
            ? view.public.conditions.map(c => ({
                  on: c.on,
                  let: {
                      ...c.let,
                      custom: c.let.custom
                          ? Handlebars.compile(c.let.custom, { noEscape: true })(view)
                          : undefined,
                  },
                  otherwise: isDefined(c.otherwise)
                      ? {
                            ...c.otherwise,
                            custom: c.otherwise.custom
                                ? Handlebars.compile(c.otherwise.custom, { noEscape: true })(view)
                                : undefined,
                        }
                      : undefined,
              }))
            : undefined
        view.private.conditions = view.private.conditions
            ? view.private.conditions.map(c => ({
                  on: c.on,
                  let: {
                      ...c.let,
                      custom: c.let.custom
                          ? Handlebars.compile(c.let.custom, { noEscape: true })(view)
                          : undefined,
                  },
                  otherwise: isDefined(c.otherwise)
                      ? {
                            ...c.otherwise,
                            custom: c.otherwise.custom
                                ? Handlebars.compile(c.otherwise.custom, { noEscape: true })(view)
                                : undefined,
                        }
                      : undefined,
              }))
            : undefined

        if (view.custom) {
            view.custom = Handlebars.compile(view.custom, { noEscape: true })(view)
        }
        const handlebarTemplate = Handlebars.compile(template, { noEscape: true })
        const content = handlebarTemplate(view)
        await this.writeCmakeFile(target, content)
    }

    private async getTemplateView(target: PackageBuilder): Promise<TemplateView> {
        const { settings } = this.getTargetSettings(target)
        const result: TemplateView = {
            public: {
                conditions: [],
            },
            private: {
                conditions: [],
            },
            globs: {},
            default: get(settings, ['default'], false),
            cmake: {
                // tslint:disable-next-line: no-invalid-template-strings
                project_name: '${PROJECT_NAME}',
                dir: target.buildPath.split(path.sep).pop()!,
            },
        }
        if (!settings) {
            return result
        }

        if (!this.seperateModule(target)) {
            result.cmake = {
                ...result.cmake,
                project: 'zpm_project()',
                // tslint:disable-next-line: no-invalid-template-strings
                target: 'zpm_default_target(${PROJECT_NAME})',
            }
        } else {
            result.cmake = {
                ...result.cmake,
                project: `zpm_module("${
                    (target.version.package.entry as InternalGSSubEntry).path
                }")`,
                target:
                    // tslint:disable-next-line: no-invalid-template-strings
                    'zpm_alias(${PROJECT_NAME})' +
                    // tslint:disable-next-line: no-invalid-template-strings
                    (result.default ? '\nzpm_default_target(${PROJECT_NAME})' : ''),
            }
        }

        for (const access of ['public', 'private']) {
            const settingsAccess = settings[
                access as keyof typeof settings
            ] as TemplateSettingsAccessView
            const resultAccess = result[access as keyof typeof result] as TemplateAccessview
            if (settingsAccess.include) {
                resultAccess.include = settingsAccess.include
            }

            if (settingsAccess.define) {
                resultAccess.define = settingsAccess.define
            }
            if (settingsAccess.link) {
                resultAccess.link = settingsAccess.link.map((f: string) =>
                    f.replace(/(^\:)\:/, '+').replace('/', '::')
                )
            }
            if (settingsAccess.feature) {
                resultAccess.feature = settingsAccess.feature
            }
            if (settingsAccess.conditions) {
                resultAccess.conditions = await Promise.all(
                    settingsAccess.conditions.map(async c => ({
                        on: c.on,
                        let: {
                            ...(c.let.include ? { include: c.let.include } : {}),
                            ...(c.let.source
                                ? { source: await glob(c.let.source, target.buildPath, [], false) }
                                : {}),
                            ...(c.let.define ? { define: c.let.define } : {}),
                            ...(c.let.link ? { link: c.let.link } : {}),
                            ...(c.let.feature ? { feature: c.let.feature } : {}),
                            ...(c.let.option ? { option: c.let.option } : {}),
                            ...(c.let.custom ? { option: c.let.custom } : {}),
                        },
                        otherwise: isDefined(c.otherwise)
                            ? {
                                  ...(c.otherwise.include ? { include: c.otherwise.include } : {}),
                                  ...(c.otherwise.source
                                      ? {
                                            source: await glob(
                                                c.otherwise.source,
                                                target.buildPath,
                                                [],
                                                false
                                            ),
                                        }
                                      : {}),
                                  ...(c.otherwise.define ? { define: c.otherwise.define } : {}),
                                  ...(c.otherwise.link ? { link: c.otherwise.link } : {}),
                                  ...(c.otherwise.feature ? { feature: c.otherwise.feature } : {}),
                                  ...(c.otherwise.option ? { option: c.otherwise.option } : {}),
                                  ...(c.otherwise.custom ? { option: c.otherwise.custom } : {}),
                              }
                            : undefined,
                    }))
                )
            }
        }

        if (settings.source) {
            result.source = await glob(settings.source, target.buildPath, [], false)
        }
        if (settings.globs) {
            for (const key of Object.keys(settings.globs || {})) {
                result.globs[key] = await glob(settings.globs[key], target.buildPath, [], false)
            }
        }

        if (settings.custom) {
            result.custom = settings.custom
        }

        return result
    }
}
