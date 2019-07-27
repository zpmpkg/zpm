import { VersionRange } from '~/common/range'
import { InternalDefinitionEntryType } from '~/package/entryType'
import {
    getInternalDefinitionEntryType,
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
} from '~/package/internal'
import { Package } from '~/package/package'
import { PackageVersion } from '~/package/packageVersion'
import { PackageType } from '~/package/type'
import { Manifest } from '~/registry/package'
import { Registries } from '~/registry/registries'
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
    PackagePSSubNameEntry,
} from '~/types/package.v1'

describe('getInternalDefinitionEntryType', () => {
    describe('GDGS', () => {
        test('simple', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDGS)
        })
        test('repository', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDGS)
        })
        test('repository - definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
                definition: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDGS)
        })
        test('definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: 'https://example.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDGS)
        })
        test('extra', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDGS)
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDPS)
        })
        test('extras', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GDPS)
        })
    })
    describe('PDGS', () => {
        test('simple', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDGS)
        })
        test('repository', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDGS)
        })
        test('implicit path', () => {
            const entry: PackagePDGSEntry = {
                name: 'ZPM:foobar',
                version: 'master',
                definition: './',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDGS)
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
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDGS)
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: PackagePDPSEntry = {}
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDPS)
        })
        test('extras', () => {
            const entry: PackagePDPSEntry = {
                optional: true,
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PDPS)
        })
    })
    describe('GSSub', () => {
        test('simple', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/GoogleTest',
                path: './foobar',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GSSub)
        })
        test('implicit path', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/GoogleTest:foobar',
                version: 'master',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GSSub)
        })
        test('implicit path2', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/GoogleTest:foobar',
                version: 'master',
                definition: './',
            }
            // this is not a PDGS
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GSSub)
        })
        test('extras', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/GoogleTest',
                path: './foobar',
                version: 'master',
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.GSSub)
        })
    })
    describe('PSSub', () => {
        test('simple', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PSSub)
        })
        test('implicit path', () => {
            const entry: PackagePSSubNameEntry = {
                name: 'ZPM:foobar',
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PSSub)
        })
        test('extras', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                settings: {},
            }
            expect(getInternalDefinitionEntryType(entry)).toBe(InternalDefinitionEntryType.PSSub)
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
    let manifest: Manifest
    let registries: Registries
    let parent: PackageVersion
    beforeEach(() => {
        registries = jest.fn() as any
        parent = jest.fn() as any
        manifest = new Manifest(registries, 'fooType')
    })
    describe('GDGS', () => {
        test('simple', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('repository', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://example.com/foo.git',
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('repository - definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                repository: 'https://example.com/foo.git',
                definition: 'https://example.com/foo.git',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://example.com/foo.git',
                    definition: 'https://example.com/foo.git',
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('definition', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: 'https://example.com/foo.git',
            }

            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: 'https://example.com/foo.git',
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('extra', () => {
            const entry: PackageGDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                optional: true,
                settings: {},
            }

            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('alias', () => {
            const entry: PackageGDGSEntry = {
                name: 'ZPM',
                version: 'master',
            }
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDGS,
                entry: {
                    vendor: undefined,
                    name: 'ZPM',
                    repository: undefined,
                    definition: undefined,
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
    })
    describe('GDPS', () => {
        test('simple', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
            }
            const internal: InternalDefinitionGDPSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDPS,
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
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('extra', () => {
            const entry: PackageGDPSEntry = {
                definition: 'https://foo.com/foo.git',
                path: './foobar',
                optional: true,
                settings: {},
            }

            const internal: InternalDefinitionGDPSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GDPS,
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
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
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
                internalDefinitionType: InternalDefinitionEntryType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: undefined,
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('repository', () => {
            const entry: PackagePDGSEntry = {
                name: 'Zefiros-Software/Awesomeness',
                version: 'master',
                definition: './foo',
                repository: 'https://foo.com/foo.git',
            }

            const internal: InternalDefinitionPDGSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://foo.com/foo.git',
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
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
                internalDefinitionType: InternalDefinitionEntryType.PDGS,
                entry: {
                    vendor: 'Zefiros-Software',
                    name: 'Awesomeness',
                    repository: 'https://foo.com/foo.git',
                    definition: './foo',
                },
                type: 'fooType',
                usage: {
                    version: new VersionRange('master'),
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
    })
    describe('PDPS', () => {
        test('simple', () => {
            const entry: PackagePDPSEntry = {}
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PDPS,
                entry: {},
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('extra', () => {
            const entry: PackagePDPSEntry = {
                optional: true,
                settings: {},
            }
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PDPS,
                entry: {},
                type: 'fooType',
                usage: {
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
    })
    describe('GSSub', () => {
        let namedParent: Package
        beforeEach(() => {
            parent = {
                package: {
                    info: {
                        entry: {
                            path: '',
                        },
                        type: PackageType.PDPS,
                        options: {
                            rootName: 'zpm',
                            rootDirectory: '~/zpm',
                            allowDevelopment: true,
                            mayChangeRegistry: true,
                        },
                        directories: {
                            definition: '~/zpm/definition',
                            source: '~/zpm/source',
                        },
                    },
                },
            } as any
            namedParent = {
                info: {
                    entry: {
                        repository: 'foorepo',
                        definition: 'foorepo',
                        name: 'FooName',
                        vendor: 'FooVendor',
                    },
                    type: PackageType.GDGS,
                    options: {
                        allowDevelopment: true,
                        mayChangeRegistry: true,
                    },
                    directories: {
                        definition: '~/named/definition',
                        source: '~/named/source',
                    },
                },
            } as any
            manifest.searchByName = jest.fn().mockReturnValue(namedParent)
        })
        test('simple', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: './foobar',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'foobar',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('implicit path', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM:foobar',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'foobar',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('implicit path sub', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM:foobar/barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'foobar/barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'foobar/barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('implicit path sub resolve', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM:foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('path sub', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: './foobar/barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'foobar/barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'foobar/barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('path sub resolve', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: './foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('path sub resolve 2', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: 'foobar/../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('path sub resolve 3', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: '../barfoo',
                version: 'master',
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: '../barfoo',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: '../barfoo',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
        test('extras', () => {
            const entry: PackageGSSubEntry = {
                name: 'Zefiros-Software/ZPM',
                path: './foobar',
                version: 'master',
                settings: {},
            }
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.GSSub,
                entry: {
                    path: 'foobar',
                    repository: 'foorepo',
                },
                root: {
                    name: 'ZPM',
                    vendor: 'Zefiros-Software',
                    version: 'master',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: true,
                    packageDirectory: '~/named/source',
                    packageName: 'FooName',
                    packageVendor: 'FooVendor',
                    rootDirectory: '~/zpm/definition',
                    rootName: 'zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: {
                    optional: false,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                {
                    internalDefinitionType: 'GDGS',
                    entry: {
                        name: 'ZPM',
                        vendor: 'Zefiros-Software',
                    },
                    type: 'fooType',
                    usage: {
                        version: new VersionRange('master'),
                        optional: false,
                        settings: {},
                    },
                },
                internal,
            ])
        })
    })
    describe('PSSub - path only - PDPS parent', () => {
        beforeEach(() => {
            parent = {
                package: {
                    info: {
                        entry: {
                            path: '',
                        },
                        type: PackageType.PDPS,
                        options: {
                            rootName: 'zpm',
                            rootDirectory: '~/zpm',
                            allowDevelopment: true,
                            mayChangeRegistry: true,
                        },
                    },
                },
            } as any
        })
        test('simple', () => {
            const entry: PackagePSSubEntry = {
                path: './foobar',
            }

            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { vendor: undefined, name: 'zpm' },
                entry: { path: 'foobar' },
                options: {
                    rootName: 'zpm',
                    rootDirectory: '~/zpm',
                    allowDevelopment: true,
                    mayChangeRegistry: true,
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('extra', () => {
            const entry: PackagePSSubEntry = {
                path: './foobar',
                optional: true,
                settings: {},
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { vendor: undefined, name: 'zpm' },
                entry: { path: 'foobar' },
                options: {
                    allowDevelopment: true,
                    mayChangeRegistry: true,
                    rootName: 'zpm',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: {
                    optional: true,
                    settings: {},
                },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
    })
    describe('PSSub - Named', () => {
        beforeEach(() => {
            parent = {
                package: {
                    info: {
                        entry: {
                            path: '',
                        },
                        type: PackageType.PDPS,
                        options: {
                            rootName: 'zpm',
                            rootDirectory: '~/zpm',
                            allowDevelopment: true,
                            mayChangeRegistry: true,
                        },
                    },
                },
            } as any
            manifest.searchByName = jest.fn().mockReturnValueOnce({
                info: {
                    entry: {
                        path: '',
                    },
                    type: PackageType.PDPS,
                    directories: {
                        source: '~/zpm',
                    },
                },
            })
        })
        test('simple', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'foobar',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }

            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('implicit path', () => {
            const entry: PackagePSSubNameEntry = {
                name: 'ZPM:foobar',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'foobar',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('implicit path sub', () => {
            const entry: PackagePSSubNameEntry = {
                name: 'ZPM:foobar/barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'foobar/barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar/barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('implicit path sub resolve', () => {
            const entry: PackagePSSubNameEntry = {
                name: 'ZPM:foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('path sub', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar/barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'foobar/barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar/barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('path sub resolve', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('path sub resolve 2', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: 'foobar/../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('path sub resolve 3', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: '../barfoo',
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: '../barfoo',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: '../barfoo',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
        })
        test('extras', () => {
            const entry: PackagePSSubEntry = {
                name: 'ZPM',
                path: './foobar',
                settings: {},
            }
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: InternalDefinitionEntryType.PSSub,
                root: { name: 'ZPM' },
                entry: {
                    path: 'foobar',
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: false,
                    rootName: 'ZPM',
                    rootDirectory: '~/zpm',
                    subPath: 'foobar',
                },
                type: 'fooType',
                usage: { optional: false, settings: {} },
            }
            expect(transformToInternalDefinitionEntry(entry, manifest, 'fooType', parent)).toEqual([
                internal,
            ])
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
            const entry: RegistryPDPSEntry = {}
            const internal: InternalPDPSEntry = {}
            expect(transformToInternalEntry(entry)).toEqual(internal)
        })
    })
})
