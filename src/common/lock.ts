import assert from 'assert'

export default class AwaitLock {
    public acquired: boolean
    public waitingResolvers: Array<() => void>

    constructor() {
        this.acquired = false
        this.waitingResolvers = []
    }

    public acquire(): Promise<void> {
        if (!this.acquired) {
            this.acquired = true
            return Promise.resolve()
        }

        return new Promise(resolve => {
            this.waitingResolvers.push(resolve)
        })
    }

    public release(): void {
        assert(this.acquired, 'Trying to release an unacquired lock')
        if (this.waitingResolvers.length > 0) {
            const resolve = this.waitingResolvers.shift()!
            resolve()
        } else {
            this.acquired = false
        }
    }

    public async withLock<O>(fn: () => Promise<O>): Promise<O> {
        await this.acquire()
        let out: O
        try {
            out = await fn()
        } catch (e) {
            this.release()
            throw e
        }
        this.release()
        return out
    }
}
