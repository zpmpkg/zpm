import cliSpinners from 'cli-spinners'
// import hasUnicode from 'has-unicode'
import logUpdate from 'log-update'
// import ora from 'ora'
import { WritableStreamBuffer } from 'stream-buffers'
import symbols from 'log-symbols'

export class Spinner {
    public stream: WritableStreamBuffer = new WritableStreamBuffer()
    public spinner: any
    public text: string
    public suffix!: string
    public frame!: string
    public frameIndex: number = 0
    public running: boolean = true
    constructor(text: string = '') {
        this.spinner = cliSpinners.dots
        this.text = text
    }

    public render() {
        if (this.running) {
            if (this.stream.size() > 0) {
                this.suffix = this.stream
                    .getContentsAsString()
                    .trimRight()
                    .split(/\n+/)
                    .pop()!
                    .split(/\r+/)
                    .pop()!
            }

            const frame = this.spinner.frames[this.frameIndex]
            this.frameIndex = ++this.frameIndex % this.spinner.frames.length

            this.frame = `${frame} ${this.text} ${this.suffix}`
        } else {
            this.frame = this.text
        }
    }

    public stop() {
        this.running = false
    }

    public stopAndPersist(options: { text?: string; symbol?: string } = {}) {
        this.running = false
        this.text = `${options.symbol || ' '} ${options.text || this.text}`
    }

    public succeed(text?: string) {
        this.stopAndPersist({ text, symbol: symbols.success })
    }

    public fail(text?: string) {
        this.stopAndPersist({ text, symbol: symbols.error })
    }

    public warn(text?: string) {
        this.stopAndPersist({ text, symbol: symbols.warning })
    }

    public info(text?: string) {
        this.stopAndPersist({ text, symbol: symbols.info })
    }
}

export class Spinners {
    public interval: number = 80
    public spinners: Spinner[] = []
    public id: any

    public create(text?: string) {
        const added = new Spinner(text)
        this.spinners.push(added)
        return added
    }

    public start() {
        this.render()
        this.id = setInterval(this.render.bind(this), this.interval)

        return this
    }

    public render() {
        this.spinners.forEach(s => {
            s.render()
        })
        const content = this.spinners
            .map(s => {
                return s.frame
            })
            .join('\n')
        if (content.length > 0) {
            logUpdate(content)
            //console.log(content)
        }
    }

    public stop() {
        clearInterval(this.id)
        this.id = undefined

        this.spinners.forEach(s => {
            s.stop()
        })

        this.render()
        logUpdate.done()
        this.spinners = []
    }
}

export const spinners = new Spinners()
