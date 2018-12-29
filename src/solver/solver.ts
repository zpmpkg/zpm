import { ZPM } from '~/zpm'
import { SolutionList, SolutionNode } from './node'

export async function solveDependencies() {
    return {}
}

export class Solver {
    public zpm: ZPM
    public solutionList: SolutionList
    constructor(instance: ZPM) {
        this.zpm = instance
        this.solutionList = new SolutionList()
    }

    public async solve() {
        const root = new SolutionNode(this.zpm.root, undefined, this.solutionList)

        await root.expand()
    }
}
