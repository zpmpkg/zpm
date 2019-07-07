import inquirer from 'inquirer'
import AwaitLock from '~/common/lock'
import { isDefined } from '~/common/util'

class Inquisitor {
    private answers: { [question: string]: string }
    private lock: AwaitLock
    constructor() {
        this.answers = {}
        this.lock = new AwaitLock()
    }
    public async ask(
        name: string,
        question: inquirer.Questions,
        options: { all?: string }
    ): Promise<string> {
        return this.withLock(() => this.inquire(name, { ...question, name: 'answer' }, options))
    }

    public async withLock<O>(fn: () => Promise<O>): Promise<O> {
        return this.lock.withLock(fn)
    }

    private async inquire(
        name: string,
        question: inquirer.Questions,
        options: { all?: string }
    ): Promise<string> {
        const currentAnswer = this.answers[name]
        if (isDefined(currentAnswer) && currentAnswer === options.all) {
            return currentAnswer
        }
        const answer: { answer: string } = (await inquirer.prompt(question)) as any
        this.answers[name] = answer.answer
        return this.answers[name]
    }
}

export const inquisitor = new Inquisitor()

export async function askPull(packageName: string): Promise<boolean> {
    const answer = await inquisitor.ask(
        'askPull',
        {
            message: `Package ${packageName} was not found in the cache. Do you want to pull ${packageName}`,
            choices: [
                { name: 'All packages not in the cache', value: 'all' },
                { value: 'yes', name: 'yes' },
                { name: 'no', value: 'no' },
            ],
            default: 'all',
            type: 'rawlist',
        },
        { all: 'all' }
    )
    return ['yes', 'all'].includes(answer)
}

export async function askRegistry(registryUrl: string): Promise<boolean> {
    const answer = await inquisitor.ask(
        'askRegistry',
        {
            message: `Registry ${registryUrl} was not found in the cache. Do you want to pull ${registryUrl}`,
            choices: [
                { name: 'All registries not in the cache', value: 'all' },
                { value: 'yes', name: 'yes' },
                { name: 'no', value: 'no' },
            ],
            default: 'all',
            type: 'rawlist',
        },
        { all: 'all' }
    )
    return ['yes', 'all'].includes(answer)
}
