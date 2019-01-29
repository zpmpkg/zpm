import Ajv, { ValidateFunction } from 'ajv'
import betterAjvErrors from 'better-ajv-errors'
import { omit } from 'lodash'
import { definitionsV1 } from '~/schemas/schemas'

const ajv = new Ajv({ useDefaults: true, jsonPointers: true })

export function buildSchema(schema: any): ValidateFunction {
    return ajv.compile({
        ...schema,
        definitions: { ...omit(definitionsV1, '$schema'), ...schema.definitions },
    })
}

export function validateSchema<T, R = T>(
    instance: T,
    schema?: any,
    options?: { throw?: boolean; origin?: string; validator?: ValidateFunction }
): R {
    options = {
        throw: true,
        ...(options || {}),
    }
    const validate = options.validator || buildSchema(schema)
    if (!validate(instance)) {
        if (options.throw) {
            throw new Error(
                `Failed to validate${
                    options.origin ? ` ${options.origin}` : ''
                }:\n\n${betterAjvErrors(schema, instance, [validate.errors![0]], {
                    indent: 2,
                })}`
            )
        }
    }
    return (instance as unknown) as R
}
