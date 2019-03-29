import { Configuration } from '~/common/config'
import { environment, loadEnvironment } from '~/common/environment'
import { Registries } from '~/registry/registries'
import { Builder } from './builder/builder'
import { spinners } from './cli/spinner'
import { logger } from './common/logger'
import { storage } from './common/storage'
import { isDefined } from './common/util'
import { Package, PackageType } from './registry/package'
import { SATSolver } from './solver/sat'
import { SATSolution } from './solver/solution'

export class ZPM {
    public root!: Package
    public config = new Configuration()
    public registries: Registries = new Registries(this)

    public async load(): Promise<boolean> {
        await loadEnvironment()

        await storage.init({
            dir: environment.directory.storage,
        })

        this.config.load()
        await this.registries.load()

        this.root = this.registries.addPackage(
            'libraries',
            {
                name: '$ROOT',
                path: './',
            },
            {
                absolutePath: '$ROOT',
                isRoot: true,
                type: PackageType.Path,
            }
        )
        try {
            await this.root.load()
        } catch (error) {
            logger.error(
                `Failed to load the definition of the root package:\n\n${error.message}\n${
                    error.stack
                }`
            )
            return false
        }

        const solver = new SATSolver(this.registries)
        let lockFile: SATSolution | undefined
        try {
            await solver.load()

            spinners.start()
            await solver.addPackage(this.root)
            spinners.stop()
            lockFile = await solver.optimize()
            spinners.stop()
        } catch (error) {
            spinners.stop()
            logger.error(`Failed to resolve the dependency graph:\n\n${error.stack}`)
            return false
        }

        if (isDefined(lockFile)) {
            spinners.start()

            const builder = new Builder(this.registries, this.root, lockFile)
            await builder.load()
            spinners.stop()

            await builder.build()
            spinners.stop()

            await solver.save()

            spinners.stop()
        } else {
            await solver.rollback()
            logger.error(`We did not find a valid dependency graph, please check your requirements`)
        }

        return true
    }
}
