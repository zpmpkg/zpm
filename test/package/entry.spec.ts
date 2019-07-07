import {
    getInternalDefinitionEntryType,
    InternalDefinitionEntyType,
    InternalDefinitionGDGSEntry,
    InternalDefinitionGDPSEntry,
    InternalDefinitionGSSubEntry,
    InternalDefinitionPDGSEntry,
    InternalDefinitionPDPSEntry,
    InternalDefinitionPSSubEntry,
    InternalGDGSEntry,
    InternalGDPSEntry,
    InternalPDGSEntry,
    InternalPDPSEntry,
    transformToInternalDefinitionEntry,
    transformToInternalEntry,
} from '~/package/entry'
import {
    RegistryGDGSEntry,
    RegistryGDPSEntry,
    RegistryPDGSEntry,
    RegistryPDPSEntry,
} from '~/types/definitions.v1'
import {
    PackageGDGSEntry,
    PackageGDPSEntry,
    PackageGSSubEntry,
    PackagePDGSEntry,
    PackagePDPSEntry,
    PackagePSSubEntry,
} from '~/types/package.v1'

describe('getInternalDefinitionEntryType', () => {
    describe('GDGS', () => {
        test('simple', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDGS)
        })
        test('repository', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDGS)
        })
        test('repository - definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
                definition: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDGS)
        })
        test('definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDGS)
        })
        test('extra', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDGS)
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDPS)
        })
        test('extras', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GDPS)
        })
    })
    describe('PDGS', () => {
        test('simple', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PDGS)
        })
        test('repository', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PDGS)
        })
        test('extra', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PDGS)
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: PackagePDPSEntry = {
                path: './foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PDPS)
        })
        test('extras', () => {
            const entry: PackagePDPSEntry = {
                path: './foobar',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PDPS)
        })
    })
    describe('GSSub', () => {
        test('simple', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GSSub)
        })
        test('implicit path', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM:foobar',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GSSub)
        })
        test('extras', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                version: 'master',
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.GSSub)
        })
    })
    describe('PSSub', () => {
        test('simple', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PSSub)
        })
        test('implicit path', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM:foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PSSub)
        })
        test('extras', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntyType.PSSub)
        })
    })
})
// describe('getInternalEntryType', () => {
//     describe('GDGS', () => {
//         test('simple', () => {
//             const entry: InternalDefinitionGDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDGS)
//         })
//         test('repository', () => {
//             const entry: InternalDefinitionGDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 repository: 'https://example.com/foo.git',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDGS)
//         })
//         test('repository - definition', () => {
//             const entry: InternalDefinitionGDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 repository: 'https://example.com/foo.git',
//                 definition: 'https://example.com/foo.git',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDGS)
//         })
//         test('definition', () => {
//             const entry: InternalDefinitionGDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 definition: 'https://example.com/foo.git',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDGS)
//         })
//         test('extra', () => {
//             const entry: InternalDefinitionGDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 optional: true,
//                 settings: {},
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDGS)
//         })
//     })
//     describe('GDPS', () => {
//         test('simple', () => {
//             const entry: InternalDefinitionGDPSEntry = {
//                 definition: 'https://foo.com/foo.git',
//                 path: './foobar',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDPS)
//         })
//         test('extras', () => {
//             const entry: InternalDefinitionGDPSEntry = {
//                 definition: 'https://foo.com/foo.git',
//                 path: './foobar',
//                 optional: true,
//                 settings: {},
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.GDPS)
//         })
//     })
//     describe('PDGS', () => {
//         test('simple', () => {
//             const entry: InternalDefinitionPDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 definition: './foo',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.PDGS)
//         })
//         test('repository', () => {
//             const entry: InternalDefinitionPDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 definition: './foo',
//                 repository: 'https://foo.com/foo.git',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.PDGS)
//         })
//         test('extra', () => {
//             const entry: InternalDefinitionPDGSEntry = {
//                 vendor: 'Zefiros-Software',
//                 name: 'Awesomeness',
//                 version: 'master',
//                 definition: './foo',
//                 repository: 'https://foo.com/foo.git',
//                 optional: true,
//                 settings: {},
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.PDGS)
//         })
//     })
//     describe('PDPS', () => {
//         test('simple', () => {
//             const entry: InternalDefinitionPDPSEntry = {
//                 path: './foobar',
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.PDPS)
//         })
//         test('extras', () => {
//             const entry: InternalDefinitionPDPSEntry = {
//                 path: './foobar',
//                 optional: true,
//                 settings: {},
//             }
//             expect(getInternalEntryType(entry)).toBe(InternalEntryType.PDPS)
//         })
//     })
// })

describe('transformToInternalDefinitionEntry', () => {
    describe('GDGS', () => {
        test('simple', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('repository', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://example.com/foo.git',
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('repository - definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
                definition: 'https://example.com/foo.git',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://example.com/foo.git',
                    definition: 'https://example.com/foo.git',
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: 'https://example.com/foo.git',
            }

            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: 'https://example.com/foo.git',
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extra', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                optional: true,
                settings: {},
            }

            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('alias', () => {
            const entry: PackageGDGSEntry = {
                name: 'ZPM',
                version: 'master',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDGS,
                entry: {
                    vendor: undefined,
                    name: 'ZPM',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            const internal: InternalDefinitionGDPSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDPS,
                entry: {
                    definition: 'https://foo.com/foo.git',
                    path: './foobar',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extra', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
                optional: true,
                settings: {},
            }

            const internal: InternalDefinitionGDPSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GDPS,
                entry: {
                    definition: 'https://foo.com/foo.git',
                    path: './foobar',
                },
                type: 'fooType',
                usage: {
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
    describe('PDGS', () => {
        test('simple', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
            }

            const internal: InternalDefinitionPDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('repository', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
            }

            const internal: InternalDefinitionPDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://foo.com/foo.git',
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extra', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
                optional: true,
                settings: {},
            }
            const internal: InternalDefinitionPDGSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://foo.com/foo.git',
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: 'master',
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: PackagePDPSEntry = {
                path: './foobar',
            }
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PDPS,
                entry: {
                    path: './foobar',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extra', () => {
            const entry: PackagePDPSEntry = {
                path: './foobar',
                optional: true,
                settings: {},
            }
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PDPS,
                entry: {
                    path: './foobar',
                },
                type: 'fooType',
                usage: {
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
    describe('GSSub', () => {
        test('simple', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }

            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM:foobar',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path sub', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM:foobar/barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'foobar/barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path sub resolve', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM:foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar/barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'foobar/barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve 2', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: 'foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve 3', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: '../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: '../barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extras', () => {
            const entry: PackageGSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                version: 'master',
                settings: {},
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.GSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                    version: 'master',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
    describe('PSSub', () => {
        test('simple', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }

            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM:foobar',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path sub', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM:foobar/barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'foobar/barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('implicit path sub resolve', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM:foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar/barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'foobar/barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve 2', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: 'foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('path sub resolve 3', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: '../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: '../barfoo',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
        test('extras', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                settings: {},
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntyType.PSSub,
                entry: {
                    path: 'foobar',
                },
                root: {
                    name: 'ZPM',
                    vendor: undefined,
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, 'fooType')).toEqual(internal)
        })
    })
})

describe('transformToInternalEntry', () => {
    describe('GDGS', () => {
        test('simple', () => {
            const entry: RegistryGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                repository: 'https://foo.com/foo.git',
            }
            const internal: InternalGDGSEntry = {
                vendor: 'Zefiros-Software',
                name: 'Awesomeness',
                repository: 'https://foo.com/foo.git',
                definition: undefined,
            }
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
        test('definition', () => {
            const entry: RegistryGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                repository: 'https://foo.com/foo.git',
                definition: 'https://example.com/foo.git',
            }

            const internal: InternalGDGSEntry = {
                vendor: 'Zefiros-Software',
                name: 'Awesomeness',
                repository: 'https://foo.com/foo.git',
                definition: 'https://example.com/foo.git',
            }
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: RegistryGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            const internal: InternalGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
    })
    describe('PDGS', () => {
        test('simple', () => {
            const entry: RegistryPDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                repository: 'https://foo.com/foo.git',
                definition: './foo',
            }

            const internal: InternalPDGSEntry = {
                vendor: 'Zefiros-Software',
                name: 'Awesomeness',
                repository: 'https://foo.com/foo.git',
                definition: './foo',
            }
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: RegistryPDPSEntry = {
                path: './foobar',
            }
            const internal: InternalPDPSEntry = { path: './foobar' }
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
    })
})
