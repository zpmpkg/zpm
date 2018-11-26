import { sha256 } from 'js-sha256'

export function shortHash(hash: string) {
    return shorten(sha256(hash))
}
export function shorten(str: string) {
    return str.substring(0, 5)
}
