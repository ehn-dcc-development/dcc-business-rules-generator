import Ajv from "ajv"
const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    validateSchema: false   // prevent that AJV throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
})
import addFormats from "ajv-formats"
addFormats(ajv)


export type ErrorType = string | null

export const createSchemaValidator = (schema: any): (json: any) => ErrorType => {
    const ajvSchemaValidator = ajv.compile(schema)
    return (json: any): ErrorType => {
        const valid = ajvSchemaValidator(json)
        return valid ? null : ajv.errorsText(ajvSchemaValidator.errors)
    }
}

