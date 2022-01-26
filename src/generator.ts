import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {dataAccesses} from "certlogic-js/dist/validation"
import {and_, plusTime_, var_} from "certlogic-js/dist/factories"

import {asDateTime_, Case, dn_, dt_, eq_, now_, sd_, when_, whenVaccination_} from "./factories"
import {translations} from "./i18n"
import {Rule} from "./rules"
import {
    Combo,
    isRange,
    Specification,
    VaccinesSpecification,
    ValiditySpecification
} from "./specification"


const leftPad0 = (str: string, n: number): string =>
    "0".repeat(n - str.length) + str

const makeRule = (countryId: string, num: number, validFrom: string, { genSource, logic }: RuleGenSpec): Rule => {
    if (!(genSource in translations)) {
        console.error(`no translations for rule of type '${genSource}' defined in src/resources/i18.json`)
    }
    return {
        Identifier: `VR-${countryId}-${leftPad0(`${num}`, 4)}`,
        Type: "Acceptance",
        Country: countryId,
        Version: "1.0.0",
        SchemaVersion: "1.0.0",
        Engine: "0.7.5", // TODO  -> specificationVersion, but has to be accepted by Gateway
        CertificateType: "Vaccination",
        Description: Object
            .entries(translations[genSource])
            .map(([ lang, desc ]) => ({ lang, desc })),
        ValidFrom: validFrom,
        ValidTo: "2030-06-01T00:00:00Z",
        AffectedFields: dataAccesses(logic)
            .filter((fieldName) => fieldName.startsWith("payload."))
            .map((fieldName) => fieldName.substring("payload.".length)),
        Logic: logic
    }
}


type RuleGenSpec = {
    genSource: string
    logic: CertLogicExpression
}

export type Rules = { [genSource: string]: Rule }

const makeRules = (countryId: string, validFrom: string, ruleGenSpecs: RuleGenSpec[]): Rules =>
    Object.fromEntries(
        ruleGenSpecs
            .map((ruleGenSpec, number) =>
                [ ruleGenSpec.genSource, makeRule(countryId, number, validFrom, ruleGenSpec) ]
            )
    )


const caseExprForCombo = (combo: Combo) => {
    if (combo === "other") {
        return and_(
            eq_(dn_, sd_),
            { ">": [ sd_, 3 ] }
        )
    }
    const combiMatch = combo.match(/^(\d+)\/(\d+)$/)!!
    const dn = parseInt(combiMatch[1], 10)
    const sd = parseInt(combiMatch[2], 10)
    return and_(
        eq_(dn_, dn), eq_(sd_, sd)
    )
}

const caseForCombo = (combo: Combo, validitySpec: ValiditySpecification): Case =>
    [
        caseExprForCombo(combo),
        (() => {
            if (validitySpec === null) {
                return false
            }
            if (typeof validitySpec === "number") {
                return {
                    "not-before": [
                        asDateTime_(now_),
                        plusTime_(dt_, validitySpec, "day")
                    ]
                }
            }
            if (isRange(validitySpec)) {
                // TODO  implement this
            }
            throw new Error(`validity specification not handled: ${JSON.stringify(validitySpec, null, 2)}`)
        })()
    ]


const guardForVaccines = (vaccineIds: string[]): CertLogicOperation =>
    vaccineIds.length === 1
        ? eq_(var_("payload.v.0.mp"), vaccineIds[0])
        : { "in": [
            var_("payload.v.0.mp"),
            vaccineIds
        ]}

const caseForVaccineSpecification = (vaccineSpec: VaccinesSpecification): Case =>
    [
        guardForVaccines(vaccineSpec.vaccineIds),
        when_(
            vaccineSpec.comboSpecs
                .filter(({ validity }) => validity === null || (typeof validity === "number" && validity > 0) || (typeof validity === "object"))
                .flatMap(({ combos, validity }) => combos.map((combo) => caseForCombo(combo, validity))),
            true
        )
    ]


export const generateRulesFrom = ({ country, validFrom, vaccineSpecs, maxValid }: Specification): Rules =>
    makeRules(country, validFrom, [
        {
            genSource: "vaccine-not-recognised",
            logic: whenVaccination_(
                { "in": [ var_("payload.v.0.mp"), var_("external.valueSets.vaccines-covid-19-names") ] }
            )
        },
        {
            genSource: "vaccine-not-accepted",
            logic: whenVaccination_(
                { "in": [ var_("payload.v.0.mp"), vaccineSpecs.flatMap((vaccineSpec) => vaccineSpec.vaccineIds) ] }
            )
        },
        {
            genSource: "course-not-completed",
            logic: whenVaccination_(
                { ">=": [ dn_, sd_ ] }
            )
        },
        {
            genSource: "vaccination-before-today",
            logic: whenVaccination_(
                { "not-before": [
                        asDateTime_(now_),
                        asDateTime_(dt_)
                    ] }
            )
        },
        {
            genSource: "delay-time-not-yet-elapsed",
            logic: whenVaccination_(
                when_(
                    vaccineSpecs.map(caseForVaccineSpecification)
                )
            )
        },
        ...(maxValid === undefined
            ? []
            : [{
                genSource: "vaccination-not-too-old",
                logic: whenVaccination_({ "not-after": [ asDateTime_(now_), plusTime_(dt_, 365, "day") ] })
            }])
    ])

