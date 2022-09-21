// To parse this data:
//
//   import { Convert, DecodeTokenInterface } from "./file";
//
//   const decodeTokenInterface = Convert.toDecodeTokenInterface(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface DecodeTokenInterface {
    infoUsuario:     InfoUsuario;
    perfilesUsuario: PerfilesUsuario[];
    menuUsuario:     MenuUsuario;
    iat:             number;
    exp:             number;
    dependenciasUsuario: DependenciasUsuario[];
    permisosUsuario: PermisosUsuario[];
}

export interface InfoUsuario {
    id:           number;
    fullname:     string;
    email:        string;
    username:     string;
    codusersap:   string;
    status:       string;
    id_company:   number;
    companyname:  string;
    logoempresa:  string;
    bdmysql:      string;
    dbcompanysap: string;
    urlwssap:     string;
}

export interface MenuUsuario {
    opcionesMenu:    OpcionesMenu[];
    opcionesSubMenu: OpcionesMenu[];
}

export interface OpcionesMenu {
    id:          number;
    title:       string;
    description: string;
    ordernum:    string;
    hierarchy:   string;
    iddad:       number | null;
    url:         string;
    icon:        string;
    estado:      string;
    created_at:  Date;
}

export interface PerfilesUsuario {
    id:     number;
    perfil: string;
}

export interface DependenciasUsuario {
    id:     number;
    codusersap:string;
    dependence: string;
    location: string;
    vicepresidency:string;
}

export interface PermisosUsuario{
    id_perfil:number;
    id_menu:number;
    read_accion: number;
    create_accion: number;
    update_accion: number;
    delete_accion: number;
    aproved_accion: number;
    perfil:string;
    title:string;
    url:string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toDecodeTokenInterface(json: string): DecodeTokenInterface {
        return cast(JSON.parse(json), r("DecodeTokenInterface"));
    }

    public static decodeTokenInterfaceToJson(value: DecodeTokenInterface): string {
        return JSON.stringify(uncast(value, r("DecodeTokenInterface")), null, 2);
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
    "DecodeTokenInterface": o([
        { json: "infoUsuario", js: "infoUsuario", typ: r("InfoUsuario") },
        { json: "perfilesUsuario", js: "perfilesUsuario", typ: a(r("PerfilesUsuario")) },
        { json: "menuUsuario", js: "menuUsuario", typ: r("MenuUsuario") },
        { json: "iat", js: "iat", typ: 0 },
        { json: "exp", js: "exp", typ: 0 },
    ], false),
    "InfoUsuario": o([
        { json: "id", js: "id", typ: 0 },
        { json: "fullname", js: "fullname", typ: "" },
        { json: "email", js: "email", typ: "" },
        { json: "username", js: "username", typ: "" },
        { json: "codusersap", js: "codusersap", typ: "" },
        { json: "status", js: "status", typ: "" },
        { json: "id_company", js: "id_company", typ: 0 },
        { json: "companyname", js: "companyname", typ: "" },
        { json: "logoempresa", js: "logoempresa", typ: "" },
        { json: "bdmysql", js: "bdmysql", typ: "" },
        { json: "dbcompanysap", js: "dbcompanysap", typ: "" },
        { json: "urlwssap", js: "urlwssap", typ: "" },
    ], false),
    "MenuUsuario": o([
        { json: "opcionesMenu", js: "opcionesMenu", typ: a(r("OpcionesMenu")) },
        { json: "opcionesSubMenu", js: "opcionesSubMenu", typ: a(r("OpcionesMenu")) },
    ], false),
    "OpcionesMenu": o([
        { json: "id", js: "id", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "ordernum", js: "ordernum", typ: "" },
        { json: "hierarchy", js: "hierarchy", typ: "" },
        { json: "iddad", js: "iddad", typ: u(0, null) },
        { json: "url", js: "url", typ: "" },
        { json: "icon", js: "icon", typ: "" },
        { json: "estado", js: "estado", typ: "" },
        { json: "created_at", js: "created_at", typ: Date },
    ], false),
    "PerfilesUsuario": o([
        { json: "id", js: "id", typ: 0 },
        { json: "perfil", js: "perfil", typ: "" },
    ], false),
};
