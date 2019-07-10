"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const ajv_1 = __importDefault(require("ajv"));
const better_ajv_errors_1 = __importDefault(require("better-ajv-errors"));
const schemas_1 = require("../schemas/schemas");
const ajv = new ajv_1.default({ useDefaults: true, jsonPointers: true, allErrors: false });
function buildSchema(schema) {
    return ajv.compile({
        ...schema,
        definitions: { ...axioms_1.omit(schemas_1.definitionsV1, '$schema'), ...schema.definitions },
    });
}
exports.buildSchema = buildSchema;
function validateSchema(instance, schema, options) {
    options = {
        throw: true,
        ...(options || {}),
    };
    const validate = options.validator || buildSchema(schema);
    if (!validate(instance)) {
        if (options.throw) {
            throw new Error(`Failed to validate${options.origin ? ` ${options.origin}` : ''}:\n\n${better_ajv_errors_1.default(schema, instance, [validate.errors[0]], {
                indent: 2,
            })}`);
        }
    }
    return instance;
}
exports.validateSchema = validateSchema;
//# sourceMappingURL=validation.js.map