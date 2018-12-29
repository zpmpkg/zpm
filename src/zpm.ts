import { Configuration } from '~/common/config'
import { environment, loadEnvironment } from '~/common/environment'
import { Registries } from '~/registry/registries'
import { loadCLI } from './cli/program'
import { logger } from './common/logger'
import { storage } from './common/storage'
import { Package } from './registry/package'
import { Solver } from './solver/solver'
import { SATSolver } from './solver/sat'

export class ZPM {
    public root!: Package
    public solver!: Solver
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

        const path = './sandbox'
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
            logger.error(`Failed to load the definition of the root package:\n\n${error.message}`)
            return false
        }

        this.solver = new Solver(this)
        await this.solver.solve()

        const solver = new SATSolver()
        await solver.addPackage(this.root)
        // await solver.addPackage(
        //     this.registries.manifests.libraries.entries['Zefiros-Software/Boost']
        // )
        // await solver.addPackageRequirements({
        //     required: [
        //         [
        //             'libraries:GIT:Zefiros-Software/Boost@1.69.0',
        //             'libraries:GIT:Zefiros-Software/Boost@1.63.0',
        //         ],
        //     ],
        // })
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        solver.solve()
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        solver.optimize()
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

        return true
    }
}
