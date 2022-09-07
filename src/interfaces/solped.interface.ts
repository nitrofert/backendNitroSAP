// To parse this data:
//
//   import { Convert, SolpedInterface } from "./file";
//
//   const solpedInterface = Convert.toSolpedInterface(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SolpedInterface {
    solped:    Solped;
    solpedDet: SolpedDet[];
}

export interface Solped {
    id:                number;
    id_user:           number;
    usersap:           string;
    fullname:          string;
    serie:             string;
    status:            string;
    sapdocnum:         string;
    docdate:           string;
    docduedate:        string;
    taxdate:           string;
    reqdate:           string;
    u_nf_depen_solped: string;
    approved:          string;
    created_at:        string;
    updated_at:        string;
}

export interface SolpedDet {
    id_soplped:   number;
    linenum:      number;
    linestatus:   string;
    itemcode:     string;
    dscription:   string;
    reqdatedet:   string;
    linevendor:   string;
    acctcode:     string;
    acctcodename: string;
    quantity:     number;
    price:        number;
    linetotal:    number;
    tax:          number;
    linegtotal:   number;
    ocrcode:      string;
    ocrcode2:     string;
    ocrcode3:     string;
    id_user:      string;
    created_at:   string;
    updated_at:   string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSolpedInterface(json: string): SolpedInterface {
        return cast(JSON.parse(json), r("SolpedInterface"));
    }

    public static solpedInterfaceToJson(value: SolpedInterface): string {
        return JSON.stringify(uncast(value, r("SolpedInterface")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "SolpedInterface": o([
        { json: "solped", js: "solped", typ: r("Solped") },
        { json: "solpedDet", js: "solpedDet", typ: a(r("SolpedDet")) },
    ], false),
    "Solped": o([
        { json: "id", js: "id", typ: 0 },
        { json: "id_user", js: "id_user", typ: 0 },
        { json: "usersap", js: "usersap", typ: "" },
        { json: "fullname", js: "fullname", typ: "" },
        { json: "serie", js: "serie", typ: "" },
        { json: "status", js: "status", typ: "" },
        { json: "sapdocnum", js: "sapdocnum", typ: "" },
        { json: "docdate", js: "docdate", typ: "" },
        { json: "docduedate", js: "docduedate", typ: "" },
        { json: "taxdate", js: "taxdate", typ: "" },
        { json: "reqdate", js: "reqdate", typ: "" },
        { json: "u_nf_depen_solped", js: "u_nf_depen_solped", typ: "" },
        { json: "approved", js: "approved", typ: "" },
        { json: "created_at", js: "created_at", typ: "" },
        { json: "updated_at", js: "updated_at", typ: "" },
    ], false),
    "SolpedDet": o([
        { json: "id_soplped", js: "id_soplped", typ: 0 },
        { json: "linenum", js: "linenum", typ: 0 },
        { json: "linestatus", js: "linestatus", typ: "" },
        { json: "itemcode", js: "itemcode", typ: "" },
        { json: "dscription", js: "dscription", typ: "" },
        { json: "reqdatedet", js: "reqdatedet", typ: "" },
        { json: "linevendor", js: "linevendor", typ: "" },
        { json: "acctcode", js: "acctcode", typ: "" },
        { json: "acctcodename", js: "acctcodename", typ: "" },
        { json: "quantity", js: "quantity", typ: 0 },
        { json: "price", js: "price", typ: 0 },
        { json: "linetotal", js: "linetotal", typ: 0 },
        { json: "tax", js: "tax", typ: 0 },
        { json: "linegtotal", js: "linegtotal", typ: 0 },
        { json: "ocrcode", js: "ocrcode", typ: "" },
        { json: "ocrcode2", js: "ocrcode2", typ: "" },
        { json: "ocrcode3", js: "ocrcode3", typ: "" },
        { json: "id_user", js: "id_user", typ: "" },
        { json: "created_at", js: "created_at", typ: "" },
        { json: "updated_at", js: "updated_at", typ: "" },
    ], false),
};
