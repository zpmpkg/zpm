import { ValidateFunction } from 'ajv';
export declare function buildSchema(schema: any): ValidateFunction;
export declare function validateSchema<T, R = T>(instance: T, schema?: any, options?: {
    throw?: boolean;
    origin?: string;
    validator?: ValidateFunction;
}): R;
