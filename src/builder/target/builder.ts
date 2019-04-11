import { get } from '@zefiros/axioms'
import fs from 'fs-extra'
import Mustache from 'mustache'
import { join, relative } from 'upath'
import { workingdir } from '~/cli/program'
import { environment } from '~/common/environment'
import { copy, glob, isSubDirectory, transformPath } from '~/common/io'
import { BasePackageBuilder, PackageBuilder } from '../packageBuilder'

// interface BuilderApi {
//     pkg: PackageApi
//     git: GitApi
//     fs: FsApi
// }

interface TemplateView {
    include?: {
        files: string[]
    }
    define?: {
        definitions: string[]
    }
    link?: {
        libraries: string[]
    }
    compile?: {
        features: string[]
    }
}

export class TargetBuilder extends PackageBuilder {
    private libraryPaths: string[] = []
    public async run(target: BasePackageBuilder): Promise<boolean> {
        // console.log(
        //     target.getTargetPath(),
        //     target.package.source.definitionResolver.getDefinitionPath()
        const settings = this.getTargetSettings(target)
        console.log(settings)
        if (settings.template) {
            const templateFile = join(
                transformPath(this.package.source.definitionResolver.getDefinitionPath()),
                'templates',
                `${settings.template}.cmake`
            )
            await this.buildTemplate(target, templateFile)
        } else {
            const zpmMakeFile = join(
                target.package.source.definitionResolver.getDefinitionPath(),
                'package.cmake'
            )
            const CMakeFile = join(
                target.package.source.definitionResolver.getDefinitionPath(),
                'CMakeLists.txt'
            )

            if (fs.existsSync(zpmMakeFile)) {
                await this.buildTemplate(target, zpmMakeFile)
            } else if (fs.existsSync(CMakeFile)) {
                await fs.copySync(CMakeFile, join(target.getTargetPath(), 'CMakeLists.txt'))
            }
        }
        this.libraryPaths.push(relative(workingdir(), target.getTargetPath()))
        return true
    }

    public async finish(): Promise<boolean> {
        await fs.writeFile(
            join(environment.directory.extract, 'ZPM'),
            `
set(CMAKE_MODULE_PATH "\${CMAKE_CURRENT_SOURCE_DIR}/extern/cmake")
include(ZPM)


project(Extern LANGUAGES CXX C)
${this.libraryPaths
    .filter(p => isSubDirectory(p, environment.directory.extract))
    .map(p => `add_subdirectory("${p}" "${p}")`)
    .join('\n')}
        `
        )
        await copy(
            ['**/*.cmake'],
            transformPath(this.package.source.definitionResolver.getDefinitionPath()),
            join(environment.directory.extract, 'cmake')
        )

        return true
    }

    private getTargetSettings(target: BasePackageBuilder) {
        return get(this.lock.usage, ['settings', target.lock.id]) || {}
    }

    private async buildTemplate(target: BasePackageBuilder, file: string) {
        const template = (await fs.readFile(file)).toString()
        Mustache.escape = value => value
        const content = Mustache.render(template, await this.getTemplateView(target))
        await fs.writeFile(join(target.getTargetPath(), 'CMakeLists.txt'), content)
    }

    private async getTemplateView(target: BasePackageBuilder): Promise<TemplateView> {
        const result: TemplateView = {}
        const settings = this.getTargetSettings(target)
        if (settings.includes) {
            result.include = {
                files: settings.includes,
            }
        }
        if (settings.defines) {
            result.define = {
                definitions: settings.defines,
            }
        }
        if (settings.links) {
            result.link = {
                libraries: settings.links.map((f: string) => f.replace('/', '::')),
            }
        }
        if (settings.features) {
            result.compile = {
                features: settings.features,
            }
        }
        return result
    }
}
