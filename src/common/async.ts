import { isEmpty } from 'lodash'

class PromiseAllError extends Error {
    public errors: Error[]
    constructor(errors: Error[]) {
        super()
        this.errors = errors
        this.message = errors.map(x => x.message).join('\n')
    }
}

export function settledPromiseAll(promisesArray: Array<Promise<any>>) {
    const errors: Error[] = []

    const allSettled = Promise.all(
        promisesArray.map((value: any) => {
            return Promise.resolve(value).catch(error => {
                errors.push(error)
            })
        })
    )

    return allSettled.then(resolvedPromises => {
        if (!isEmpty(errors)) {
            throw new PromiseAllError(errors)
        }
        return resolvedPromises
    })
}
