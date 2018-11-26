import { readFileSync, writeFileSync } from 'fs'
import { compile } from 'json-schema-to-typescript'
import { keys, orderBy } from 'lodash'
const prettier = JSON.parse(readFileSync('.prettierrc').toString())

// tslint:disable-next-line:no-var-requires
const definitions = JSON.parse(readFileSync('src/schemas/definitions.v1.json').toString())
delete definitions.$schema
const definitionKeys = orderBy(keys(definitions))

function readSchema(file) {
    const contents = JSON.parse(readFileSync(file).toString())
    const schema = {
        ...contents,
        definitions: {
            ...definitions,
            ...contents.definitions,
        },
    }

    return schema
}
compile(readSchema('src/schemas/definitions.v1.json'), 'DefinitionsSchema', {
    unreachableDefinitions: true,
    declareExternallyReferenced: true,
    style: prettier,
}).then(ts => writeFileSync('src/types/definitions.v1.ts', ts))

compile(readSchema('src/schemas/configuration.v1.json'), 'ConfigurationSchema', {
    unreachableDefinitions: false,
    declareExternallyReferenced: false,
    style: prettier,
    bannerComment: `\nimport {${definitionKeys.join(', ')}} from './definitions.v1'`,
}).then(ts => writeFileSync('src/types/configuration.v1.ts', ts))

compile(readSchema('src/schemas/registry.v1.json'), 'RegistrySchema', {
    unreachableDefinitions: false,
    declareExternallyReferenced: false,
    style: prettier,
    bannerComment: `\nimport {${definitionKeys.join(', ')}} from './definitions.v1'`,
}).then(ts => writeFileSync('src/types/registry.v1.ts', ts))

compile(readSchema('src/schemas/entries.v1.json'), 'EntriesSchema', {
    unreachableDefinitions: false,
    declareExternallyReferenced: false,
    style: prettier,
    bannerComment: `\nimport {${definitionKeys.join(', ')}} from './definitions.v1'`,
}).then(ts => writeFileSync('src/types/entries.v1.ts', ts))

compile(readSchema('src/schemas/package.v1.json'), 'PackageSchema', {
    unreachableDefinitions: false,
    declareExternallyReferenced: true,
    style: prettier,
    bannerComment: `\nimport {${definitionKeys.join(', ')}} from './definitions.v1'`,
}).then(ts => writeFileSync('src/types/package.v1.ts', ts))
