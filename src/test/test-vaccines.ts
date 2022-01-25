const {equal, isTrue} = require("chai").assert

import {vaccineData} from "../vaccines"


describe("vaccine data", () => {

    it("is read", () => {
        const janssenId = "EU/1/20/1525"
        isTrue(janssenId in vaccineData)
        equal(vaccineData[janssenId], "COVID-19 Vaccine Janssen")
    })

})

