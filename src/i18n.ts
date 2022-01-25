export type Descriptions = { [lang: string]: string }

export type Translations = { [textId: string]: Descriptions }

export const translations: Translations = require("./resources/i18n.json")

