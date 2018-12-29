import Ajv from 'ajv'
import betterAjvErrors from 'better-ajv-errors'
import { omit } from 'lodash'
import { definitionsV1 } from '~/schemas/schemas'

export function validateSchema<T, R = T>(
    instance: T,
    schema: any,
    options?: { throw?: boolean; origin?: string }
): R {
    options = {
        throw: true,
        ...(options || {}),
    }
    if (schema) {
        const validator = new Ajv({ useDefaults: true, jsonPointers: true })
        if (
            !validator.validate(
                {
                    ...schema,
                    definitions: { ...omit(definitionsV1, '$schema'), ...schema.definitions },
                },
                instance
            )
        ) {
            if (options.throw) {
                throw new Error(
                    `Failed to validate${
                        options.origin ? ` ${options.origin}` : ''
                    }:\n\n${betterAjvErrors(schema, instance, [validator.errors![0]], {
                        indent: 2,
                    })}`
                )
            }
        }
    }
    return (instance as unknown) as R
}
