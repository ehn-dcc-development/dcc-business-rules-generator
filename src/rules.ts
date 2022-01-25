import {CertLogicExpression} from "certlogic-js"


export type Rule = {
    Identifier: string
    Type: "Acceptance" | "Invalidation"
    Country: string
    Version: string,
    SchemaVersion: "1.0.0" | "1.3.0"
    Engine: "0.7.5"
    CertificateType: "General" | "Recovery" | "Test" | "Vaccination"
    Description: { lang: string, desc: string }[]
    ValidFrom: string
    ValidTo: string
    AffectedFields: string[]
    Logic: CertLogicExpression
}

