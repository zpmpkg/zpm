import { forEach } from 'lodash'
import { Version } from '~/common/version'
import { Package } from '~/registry/package'

interface PackageDescriptions {
    [k: string]: SolutionNode[]
}

export class SolutionNode {
    public package: Package
    public parent: SolutionNode | undefined
    public solutionList: SolutionList

    public public: PackageDescriptions = {}
    public private: PackageDescriptions = {}

    public version: Version
    public hash: string | undefined

    constructor(
        pkg: Package,
        version: Version | undefined,
        solutionList: SolutionList,
        parent?: SolutionNode
    ) {
        this.package = pkg
        this.version = version || new Version(undefined)
        this.parent = parent
        this.solutionList = solutionList
    }

    public async expand() {
        const definition = await this.getDefinition()
        console.log(definition)
        forEach(definition.packages.public, pkg => {
            console.log(pkg)
        })
    }

    private async getDefinition() {
        return this.package.resolver.definitionResolver.getPackageDefinition(this.version.hash)
    }
}

export class SolutionList {
    public solution: { [k: string]: SolutionNode } = {}
}
