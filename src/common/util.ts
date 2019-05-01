import { sha256 } from 'js-sha256'

export function shortHash(hash: string) {
    return shorten(sha256(hash))
}
export function shorten(str: string) {
    return str.substring(0, 5)
}

export function isDefined<T>(value: T | undefined | null): value is T {
    return (value as T) !== undefined && (value as T) !== null
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
