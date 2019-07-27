import { isDefined } from '@zefiros/axioms'
import ajv = require('ajv')
import * as fs from 'fs-extra'
import { join } from 'upath'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { loadJsonOrYamlSimple, transformPath } from '~/common/io'
import { logger } from '~/common/logger'
import { buildSchema, validateSchema } from '~/common/validation'
import {
    classifyType,
    getNameFromEntry,
    getPackageInfo,
    InternalDefinitionEntry,
    Package,
    PackageInfoOptions,
    PDPSPackageOptions,
    transformToInternalEntry,
    InternalEntry,
} from '~/package/internal'
import { PackageType } from '~/package/type'
import { entriesV1 } from '~/schemas/schemas'
import { ManifestOptions } from '~/types/definitions.v1'
import { EntriesSchema } from '~/types/entries.v1'
import { PackagePDPSEntry } from '~/types/package.v1'
import { Registries } from './registries'
import { Registry } from './registry'

export class Manifest {
    public type: string
    public registries: Registries
    public entries: Map<string, Package> = new Map<string, Package>()
    public options: ManifestOptions
    public packageValidator?: ajv.ValidateFunction
    private validator = buildSchema(entriesV1)

    constructor(registries: Registries, type: string, options: ManifestOptions = {}) {
        this.registries = registries
        this.type = type
        this.options = {
            isBuildDefinition: false,
            ...options,
        }
    }

    public async load() {
        if (this.options.schema) {
            this.packageValidator = buildSchema(await this.loadFile(this.options.schema))
        }

        await settledPromiseAll(
            this.registries.registries.map(async registry => {
                let file = join(registry.directory, `${this.type}.json`)
                if (!(await fs.pathExists(file))) {
                    file = join(registry.directory, `${this.type}.yml`)
                }
                if (await fs.pathExists(file)) {
                    const contents: EntriesSchema = await this.loadFile(file)
                    try {
                        validateSchema(contents, undefined, {
                            origin: `${file}`,
                            validator: this.validator,
                        })
                        for (const entry of contents.map(transformToInternalEntry)) {
                            this.add(entry, undefined, registry)
                        }
                    } catch (e) {
                        logger.error(e)
                    }
                }
            })
        )
        this.add<PackagePDPSEntry, PDPSPackageOptions>(
            {},
            {
                allowDevelopment: false,
                mayChangeRegistry: false,
                rootDirectory: environment.directory.zpm,
                rootName: 'ZPM',
                alias: 'ZPM',
            }
        )
    }

    public add<E extends InternalEntry, O extends PackageInfoOptions>(
        entry: E,
        options?: O,
        registry?: Registry,
        force?: boolean
    ) {
        const pkgType = classifyType(entry)
        if (registry && registry.name) {
            if (pkgType === PackageType.PSSub) {
                options = (options || {
                    rootName: registry.name,
                    rootDirectory: registry.workingDirectory || registry.directory,
                }) as any
            }
        }
        const info = getPackageInfo<E, O>(entry, this.type, pkgType, options)
        const searchKey = info.name
        let pkg: Package | undefined = this.entries.get(searchKey)
        if (!isDefined(pkg) || force) {
            if (isDefined(pkg)) {
                logger.debug(`Overriding package '${pkg.info.name}' to new entry`)
            }
            pkg = new Package(this, info)
            this.entries.set(searchKey, pkg)
        }
        if (info.alias && !this.entries.has(info.alias)) {
            this.entries.set(info.alias, pkg)
        }
        return { name: searchKey, alias: info.alias, package: pkg }
    }

    public search(entry: InternalDefinitionEntry): { package: Package | undefined; name: string } {
        const name = getNameFromEntry(entry)
        // const searchKey = getName({})
        return {
            package: this.searchByName(name),
            name,
        }
    }

    public searchByName(name: string): Package | undefined {
        return this.entries.get(name)
    }

    private async loadFile(file: string): Promise<EntriesSchema> {
        return loadJsonOrYamlSimple(transformPath(file))
    }
}
