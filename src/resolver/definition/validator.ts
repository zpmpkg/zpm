import { buildSchema } from '~/common/validation'
import { packageV1 } from '~/schemas/schemas'

export const packageValiator = buildSchema(packageV1)
