import { Configuration } from '~/common/config'
import { environment, loadEnvironment } from '~/common/environment'
import { Registries } from '~/registry/registries'
import { loadCLI } from './cli/program'
import { logger } from './common/logger'
import { storage } from './common/storage'
import { Package } from './registry/package'
import { SATSolver } from './solver/sat'
import { spinners } from './cli/spinner'
import { SATSolution } from './solver/solution'
import { isDefined } from './common/util'
import { Builder } from './builder/builder'

export class ZPM {
    public root!: Package
    public config = new Configuration()
    public registries: Registries = new Registries(this)

    public async load(): Promise<boolean> {
        loadCLI()
        await loadEnvironment()

        await storage.init({
            dir: environment.directory.storage,
        })

        this.config.load()
        await this.registries.load()

        const path = './'
        this.root = this.registries.addPackage(
            'libraries',
            {
                path,
            },
            {
                isRoot: true,
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

        let lockFile: SATSolution | undefined
        try {
            spinners.start()
            const solver = new SATSolver(this.registries)
            await solver.addPackage(this.root)

            spinners.stop()

            solver.solve()
            lockFile = solver.optimize()
        } catch (error) {
            logger.error(
                `Failed to resolve the dependency graph:\n\n${error.message}\n${error.stack}`
            )
            return false
        } finally {
            spinners.stop()
        }

        if (isDefined(lockFile)) {
            spinners.start()
            const builder = new Builder(this.registries, this.root, lockFile)
            await builder.load()
        } else {
            logger.error(`We did not find a valid dependency graph, please check your requirements`)
        }

        spinners.stop()
        return true
    }
}
