import {
    InternalGDGSEntry,
    InternalGDPSEntry,
    InternalPDGSEntry,
    InternalPDPSEntry,
} from '~/package/entry'
import { classifyType } from '~/package/info'
import { PackageType } from '~/package/type'

describe('classifyType', () => {
    describe('GDGS', () => {
        test('simple', () => {
            const entry: InternalGDGSEntry = {
                name: 'Awesomeness',
                vendor: 'Zefiros-Software',
                repository: 'https://foo.com/foo.git',
            }
            expect(classifyType(entry)).toBe(PackageType.GDGS)
        })
        test('repository - definition', () => {
            const entry: InternalGDGSEntry = {
                name: 'Awesomeness',
                vendor: 'Zefiros-Software',
                repository: 'https://foo.com/foo.git',
                definition: 'https://foo.com/foo.git',
            }
            expect(classifyType(entry)).toBe(PackageType.GDGS)
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: InternalGDPSEntry = {
                path: 'foo',
                definition: 'https://foo.com/foo.git',
            }
            expect(classifyType(entry)).toBe(PackageType.GDPS)
        })
    })
    describe('PDGS', () => {
        test('simple', () => {
            const entry: InternalPDGSEntry = {
                name: 'foo',
                vendor: 'bar',
                repository: 'https://foo.com/foo.git',
                definition: 'foo',
            }
            expect(classifyType(entry)).toBe(PackageType.PDGS)
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: InternalPDPSEntry = {}
            expect(classifyType(entry)).toBe(PackageType.PDPS)
        })
    })
})
