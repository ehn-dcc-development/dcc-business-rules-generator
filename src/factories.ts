import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {binOp_, if_, plusTime_, var_} from "certlogic-js/dist/factories"


export const eq_ = (leftExpr: CertLogicExpression, rightExpr: CertLogicExpression): CertLogicOperation =>
    binOp_("===", leftExpr, rightExpr)


export type Case = [ caseExpr: CertLogicExpression, resultExpr: CertLogicExpression ]
export const when_ = (cases: Case[], default_: CertLogicExpression = true): CertLogicExpression =>
    cases.length === 0
        ? default_
        : if_(cases[0][0], cases[0][1], when_(cases.slice(1), default_))


export const dn_ = var_("payload.v.0.dn")
export const sd_ = var_("payload.v.0.sd")
export const dt_ = var_("payload.v.0.dt")
export const now_ = var_("external.validationClock")


export const asDateTime_ = (expr: CertLogicExpression) => plusTime_(expr, 0, "day")


export const whenVaccination_ = (expr: CertLogicExpression): CertLogicOperation =>
    if_(
        { "var": "payload.v.0" },
        expr,
        true
    )

