import { Spinner } from '~/cli/spinner'
import { createRepository, Repository } from '~/package/repository'

export class GitApi {
    public repository: Repository
    public spinner?: Spinner
    public constructor(source: string, spinner?: Spinner) {
        this.repository = createRepository(source)
        this.spinner = spinner
    }
    public async checkout(hash: string): Promise<void> {
        return this.repository.checkout(hash, this.spinner)
    }
}
