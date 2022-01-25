import {join} from "path"
const {isFalse, isTrue} = require("chai").assert

import {readJson} from "../dev/json-utils"
import {isValidSpecification} from "../specification"


describe("validating a specification", () => {

    it("checks for valid vaccine IDs", () => {
        isTrue(isValidSpecification(readJson(join(__dirname, "specs/test-spec.json"))))
        isFalse(isValidSpecification({
            country: "NL",
            validFrom: "2021-12-05T20:00:00+01:00",
            vaccineSpecs: [
                {
                    "vaccineIds": [ "pangalactic gargle blaster" ],
                    comboSpecs: [
                        { combos: [ "1/1" ], validity: 42 },
                        { combos: [ "2/2" ], validity: 37 },
                        { combos: [ "3/2" ], validity: null },
                        { combos: [ "3/3" ], validity: 100 },
                        { combos: [ "other" ], validity: 200 }
                    ]
                }
            ]
        }))
    })

})

