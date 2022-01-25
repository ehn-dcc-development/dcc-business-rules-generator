export type VaccineData = { [vaccineId: string]: string }

export const vaccineData: VaccineData = require("./resources/vaccineData.json")

export const idFromName = (nameFragment: string): string | undefined => {
    const entry = Object.entries(vaccineData)
        .find(([ _, name ]) => name.indexOf(nameFragment) > -1)
    return entry === undefined ? undefined : entry[0]
}

