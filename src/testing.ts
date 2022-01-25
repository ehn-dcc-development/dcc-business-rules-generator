import {evaluate} from "certlogic-js"

import {Rules} from "./generator"
import {createSchemaValidator} from "./schema-validator"
import {idFromName, vaccineData} from "./vaccines"


export type TestCase = {
    definition: TestCaseDefinition
    result: TestCaseResult
}

export type TestCaseDefinition = {
    v: string
    "@": string
    expectedFailures: string[]
}

export type TestCaseResult = {
    actualFailures: string[]
    success: boolean
}

export type TestCases = TestCase[]


export type Vaccination = {
    mp: string | undefined  // undefined means: could not map display name to vaccine ID
    dt: string
    dn: number
    sd: number
}

export const fromVString = (vStr: string): Vaccination => {
    const match = vStr.match(/^(.+?),(\d{4})-(\d{1,2})-(\d{1,2}),(\d)\/(\d)$/)!
    //                                  1    2        3         4         5    6
    return {
        mp: idFromName(match[1]),
        dt: `${match[2]}-${match[3]}-${match[4]}`,
        dn: parseInt(match[5], 10),
        sd: parseInt(match[6], 10)
    }
}


export type InputData = {
    payload: {
        v: {
            mp: string
            dt: string
            dn: number
            sd: number
        }[]
    }
    external: {
        validationClock: string
        valueSets: {
            "vaccines-covid-19-names": string[]
        }
    }
}

export const asInputData = (definition: TestCaseDefinition): InputData => {
    const {v, "@": now} = definition
    const {mp, dt, dn, sd} = fromVString(v)
    return {
        payload: {
            v: [
                {
                    mp: mp || "(???)",
                    dt, dn, sd
                }
            ]
        },
        external: {
            validationClock: now,
            valueSets: {
                "vaccines-covid-19-names": Object.keys(vaccineData)
            }
        }
    }
}


export type TestCaseExport = InputData & { success: boolean }

export const asJson = (testCase: TestCase): TestCaseExport =>
    ({
        ...asInputData(testCase.definition),
        success: testCase.result.actualFailures.length === 0
    })


const areEqual = (leftSet: string[], rightSet: string[]) =>
        leftSet.length === rightSet.length
    &&  leftSet.every((item) => rightSet.indexOf(item) > -1)

export const runRulesAgainstTestCaseDefinition = (rules: Rules, definition: TestCaseDefinition): TestCase => {
    const actualFailures = Object.entries(rules)
        .filter(([_, rule]) => {
            try {
                return !evaluate(rule.Logic, asInputData(definition))
            } catch (e) {
                console.error(e)
                return true
            }
        })
        .map(([genSource, _]) => genSource)

    return {
        definition,
        result: {
            actualFailures,
            success: areEqual(definition.expectedFailures, actualFailures)
        }
    }
}

export const runRulesAgainstTestCaseDefinitions = (rules: Rules, definitions: TestCaseDefinition[]): TestCase[] =>
    definitions.map((definition) => runRulesAgainstTestCaseDefinition(rules, definition))


export const validateTestCasesAgainstSchema = createSchemaValidator(require("./resources/testing.schema.json"))

