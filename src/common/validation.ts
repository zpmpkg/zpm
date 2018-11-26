import Ajv from 'ajv'
import { omit } from 'lodash'
import { logger } from '~/common/logger'
import { definitionsV1 } from '~/schemas/schemas'

export function validateSchema<T>(
    instance: T,
    schema,
    options?: { throw?: boolean; origin?: string }
): T {
    options = {
        throw: true,
        ...(options || {}),
    }
    if (schema) {
        const validator = new Ajv({ useDefaults: true })
        if (
            !validator.validate(
                {
                    ...schema,
                    definitions: { ...omit(definitionsV1, '$schema'), ...schema.definitions },
                },
                instance
            )
        ) {
            logger.error(`Failed to validate: ${validator.errorsText()} ${options.origin}`)
            if (options.throw) {
                throw validator.errors[0]
            }
        }
    }
    return instance
}
