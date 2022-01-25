import {PathLike, readFileSync, writeFileSync} from "fs"


export const writeJson = (path: PathLike, json: any) => {
    writeFileSync(path, JSON.stringify(json, null, 2), "utf-8")
}

export const readJson = (path: PathLike): any =>
    JSON.parse(readFileSync(path, "utf-8"))

