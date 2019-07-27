import { isDefined } from '@zefiros/axioms'
import { Configuration } from '~/common/config'
import { environment, loadEnvironment } from '~/common/environment'
// tslint:disable-next-line: no-circular-imports
import { Registries } from '~/registry/registries'
import { Builder } from './builder/builder'
import { spinners } from './cli/spinner'
import { logger } from './common/logger'
import { storage } from './common/storage'
import { InternalPDPSEntry } from './package/entry'
import { PDPSPackageOptions } from './package/info'
// tslint:disable-next-line: no-circular-imports
import { Package } from './package/package'
// tslint:disable-next-line: no-circular-imports
import { SATSolver } from './solver/sat'
import { LockFile } from './types/lockfile.v1'

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

        const rootEntry: InternalPDPSEntry = {}
        const rootOptions: PDPSPackageOptions = {
            alias: 'ROOT',
            rootName: 'ROOT',
            rootDirectory: environment.directory.workingdir,
            allowDevelopment: true,
            mayChangeRegistry: true,
        }
        this.root = this.registries.addPackage('libraries', rootEntry, rootOptions).package
        try {
            await this.root.load()
        } catch (error) {
            logger.error(
                `Failed to load the definition of the root package:\n\n${error.message}\n${error.stack}`
            )
            return false
        }

        const solver = new SATSolver(this.registries)
        let lockFile: LockFile | undefined
        try {
            spinners.start()

            await solver.addPackage(this.root)
            await solver.load()

            await solver.expand()
            spinners.stop()

            lockFile = await solver.optimize()
            spinners.stop()
        } catch (error) {
            spinners.stop()
            logger.error(`Failed to resolve the dependency graph:\n\n${error.stack}`)
            return false
        }

        if (isDefined(lockFile)) {
            try {
                spinners.start()

                const builder = new Builder(this.registries, lockFile)
                builder.load()

                await builder.build()

                spinners.stop()

                await solver.save()
            } catch (error) {
                spinners.stop()
                logger.error(`Failed to build packages:\n\n${error.stack}`)
                return false
            }
        } else {
            logger.error(`We did not find a valid dependency graph, please check your requirements`)
        }

        return true
    }
}
