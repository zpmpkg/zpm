import { SemVer } from 'semver'
import { Version } from './version'

describe('range', () => {
    describe('Version', () => {
        test('simple', () => {
            const version = new Version('1.0.0')
            expect(version.isTag).toBeFalsy()
            expect(version.tag).toEqual(undefined)
            expect(version.semver).toEqual(new SemVer('1.0.0'))
        })
        test('simple 2', () => {
            const version = new Version('2.0.0')
            expect(version.isTag).toBeFalsy()
            expect(version.tag).toEqual(undefined)
            expect(version.semver).toEqual(new SemVer('2.0.0'))
        })
        test('tag', () => {
            const version = new Version('master')
            expect(version.isTag).toBeTruthy()
            expect(version.tag).toEqual('master')
            expect(version.semver).toEqual(undefined)
        })
        test('tag multiple characters', () => {
            const version = new Version('master/wef')
            expect(version.isTag).toBeTruthy()
            expect(version.tag).toEqual('master/wef')
            expect(version.semver).toEqual(undefined)
        })
        test('tag with semver', () => {
            const version = new Version('master/wefv1.2.3')
            expect(version.isTag).toBeTruthy()
            expect(version.tag).toEqual('master/wefv1.2.3')
            expect(version.semver).toEqual(undefined)
        })
        test('tag with semver space', () => {
            expect(() => new Version('master/wef v1.2.3')).toThrow()
        })
        test('undefined remains', () => {
            expect(new Version(undefined).hash).toEqual(undefined)
            expect(new Version(undefined).semver).toEqual(undefined)
        })
    })
})
