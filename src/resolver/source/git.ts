import { isDefined } from '@zefiros/axioms'
import { reject } from 'lodash'
import { showRef } from '~/common/git'
import { Version } from '~/common/version'

export interface GitVersion {
    version: Version
    hash: string
    name: string
}

export async function listVersions(directory: string): Promise<GitVersion[]> {
    const output = await showRef(directory)
    const versions = output
        .split('\n')
        .map(s => s.split(' '))
        .filter(s => s.length === 2)
        .map(s => {
            let result
            try {
                if (s[1].includes('/tags/')) {
                    result = {
                        version: new Version(s[1].replace('refs/tags/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/tags/', ''),
                    }
                } else if (s[1].includes('/remotes/')) {
                    result = {
                        version: new Version(s[1].replace('refs/remotes/origin/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/remotes/origin/', ''),
                    }
                }
            } catch (error) {
                result = undefined
            }
            return result
        })
        .filter(isDefined)
        .sort((a, b) => b.version.cost - a.version.cost)
        .reverse()
    const fversions = reject(versions, (object, i) => {
        return i > 0 && versions[i - 1].version.toString() === object.version.toString()
    })
    return fversions
}
