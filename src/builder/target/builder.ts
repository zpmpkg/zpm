import fs from 'fs-extra'
import { join } from 'upath'
import { BasePackageBuilder, PackageBuilder, PackageType } from '../packageBuilder'

// interface BuilderApi {
//     pkg: PackageApi
//     git: GitApi
//     fs: FsApi
// }

export class TargetBuilder extends PackageBuilder {
    public async run(target: BasePackageBuilder): Promise<boolean> {
        console.log(
            target.getTargetPath(),
            target.package.source.definitionResolver.getDefinitionPath()
        )

        await fs.copySync(
            join(target.package.source.definitionResolver.getDefinitionPath(), 'CMakeLists.txt'),
            join(target.getTargetPath(), 'CMakeLists.txt')
        )
        return true
    }
}
