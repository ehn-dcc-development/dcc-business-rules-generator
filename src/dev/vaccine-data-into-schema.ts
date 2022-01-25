import {join} from "path"

import {readJson, writeJson} from "./json-utils"
import {vaccineData} from "../vaccines"

const schemaPath = join("src", "resources", "specification.schema.json")
const specificationSchema = readJson(schemaPath)
specificationSchema["$defs"]["RecognisedVaccines"].enum = Object.keys(vaccineData)
writeJson(schemaPath, specificationSchema)

