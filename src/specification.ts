import {createSchemaValidator} from "./schema-validator"


export type Specification = {
    country: string
    validFrom: string
    vaccineSpecs: VaccinesSpecification[]
    /**
     * When given (!== undefined): a positive number (integer) that specifies the maximum validity of _every_ vaccine in days.
     */
    maxValid?: number
}

export type VaccinesSpecification = {
    vaccineIds: string[]
    comboSpecs: ComboSpecification[]
}

export type ComboSpecification = {
    combos: Combo[]
    validity: ValiditySpecification
}

/**
 * "other" means (for now): n/d, with n > d > 3
 */
export type Combo = "1/1" | "2/2" | "2/1" | "3/3" | "3/2" | "3/1" | "n/n, n > 3" | "n/1, n > 3" | "other"

/**
 * `null` means: not accepted
 * A number `<n>` means: (only) valid from the `<n>`'th day after vaccination (based on calendar dates)
 */
export type ValiditySpecification = null | number | Range

export type Range = [
    from: number,
    to?: number
]

export const isRange = (range: unknown): range is Range =>
    Array.isArray(range) && 1 <= range.length && range.length <= 2


export const validateSpecificationAgainstSchema = createSchemaValidator(require("./resources/specification.schema.json"))

export const isValidSpecification = (specification: Specification): boolean =>
        validateSpecificationAgainstSchema(specification) === null

