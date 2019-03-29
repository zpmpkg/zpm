import { Spinner } from '~/cli/spinner'

export class GitApi {
    public source: string
    public spinner?: Spinner
    public constructor(source: string, spinner?: Spinner) {
        this.source = source
        this.spinner = spinner
    }
    public async checkout(hash: string): Promise<void> {
        console.log(this.source, hash)
        // return checkout(this.source, hash, { spinner: this.spinner })
    }
}
