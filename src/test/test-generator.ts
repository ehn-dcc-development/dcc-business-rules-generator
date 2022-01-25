import {existsSync} from "fs"
import {join} from "path"
const {fail, isTrue} = require("chai").assert

import {readJson, writeJson} from "../dev/json-utils"
import {generateRulesFrom} from "../generator"
import {validateSpecificationAgainstSchema} from "../specification"
import {asJson, TestCaseDefinition, TestCases, runRulesAgainstTestCaseDefinitions, validateTestCasesAgainstSchema} from "../testing"


describe("generate from file", () => {

    const genPath = join(__dirname, "gen")

    const testOnce = (specName: string) => {
        const spec = readJson(join(__dirname, "specs", `${specName}-spec.json`))
        const specErrors = validateSpecificationAgainstSchema(spec)
        if (specErrors !== null) {
            fail(`validation errors in ${specName}-spec.json: ${specErrors}`)
        }
        const rules = generateRulesFrom(spec)
        writeJson(join(genPath, `${specName}-rules.json`), rules)

        const testsPath = join(__dirname, "test-defs", `${specName}-tests.json`)
        if (existsSync(testsPath)) {
            const testCaseDefinitions: TestCaseDefinition[] = readJson(testsPath)
            const testCaseDefinitionsErrors = validateTestCasesAgainstSchema(testCaseDefinitions)
            if (testCaseDefinitionsErrors !== null) {
                fail(`validation errors in ${specName}-tests.json: ${testCaseDefinitionsErrors}`)
            }
            const testedCases: TestCases = runRulesAgainstTestCaseDefinitions(rules, testCaseDefinitions)
            testedCases.forEach((testCase) => {
                isTrue(testCase.result.success)
            })
            writeJson(join(genPath, `${specName}-tests.json`), testedCases.map(asJson))
        }
    }

    it("should work for test specification", () => {
        testOnce("test")
    })

    it("should work for NL specification", () => {
        testOnce("NL")
    })

})

