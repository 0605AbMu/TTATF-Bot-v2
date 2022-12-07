export function ObjectDeepParserForValues(obj: Object): string[] {
    if (obj == undefined || obj == null)
        return null;
    return Object.values(obj).filter(x => typeof (x) != "function" && typeof (x) != "symbol" && x != null).map(x => typeof (x) == "object" ? ObjectDeepParserForValues(x) : x).flat();
}

export function ObjectDeepParserForKeys(obj: Object): string[] {
    if (obj == undefined || obj == null)
        return null;
    return Object.keys(obj).filter(x => typeof (obj[x]) != "function" && typeof (obj[x]) != "symbol" && obj[x] != null).map(x => typeof (obj[x]) == "object" ? ObjectDeepParserForKeys(obj[x]).map(o => x + "." + o) : x).flat();
}

