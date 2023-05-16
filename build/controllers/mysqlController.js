"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const helpers_1 = __importDefault(require("../lib/helpers"));
class MySQLController {
    configSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const series = yield database_1.db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='1470000113'`);
                const items = yield database_1.db.query(`SELECT * FROM ${bdmysql}.items_sap t0 WHERE t0.validFor='Y' ORDER BY t0.ItemName ASC`);
                const cuentas = yield database_1.db.query(`Select * From ${bdmysql}.cuentas_contable`);
                const impuestos = yield database_1.db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y'`);
                const proveedores = yield database_1.db.query(`Select * From ${bdmysql}.socios_negocio t0`);
                /*const almacenes = await db.query(`Select WhsCode_Code as "WarehouseCode",
                                                        WhsName as "WarehouseName",
                                                        Location_Code,
                                                        Location,
                                                        State_Code as "State",
                                                        Name_State,
                                                        Country_Code,
                                                        Name_Country,
                                                        Address2,
                                                        Address3
                                                From ${bdmysql}.almacenes`);    */
                const areas = yield database_1.db.query(`Select area 
                                                From areas_user t0 
                                                INNER JOIN companies t1 ON t0.companyid = t1.id
                                                where t1.status ='A' and
                                                    t1.urlwsmysql = '${bdmysql}' and
                                                    t0.codusersap = '${infoUsuario[0].codusersap}'`);
                const dependenciasUsuario = yield database_1.db.query(`SELECT dependence, location, vicepresidency  
                                                        FROM dependencies_user t0
                                                        INNER JOIN companies t1 ON t1.id = t0.companyid 
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                                                                t1.urlwsmysql = '${bdmysql}' and
                                                                t1.status = 'A'`);
                /*const almacenesUsuario = await db.query(`SELECT store
                                                        FROM stores_users t0
                                                        INNER JOIN companies t1 ON t0.companyid = t1.id
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and
                                                        t1.urlwsmysql = '${bdmysql}' and
                                                        t1.status = 'A'`);*/
                const almacenesUsuario = yield database_1.db.query(`SELECT t0.store, CONCAT(t0.store,' - ',t2.WhsName) AS "label" 
                                                    FROM stores_users t0 
                                                    INNER JOIN companies t1 ON t0.companyid = t1.id
                                                    INNER JOIN ${bdmysql}.almacenes t2 ON t2.WhsCode_Code = t0.store
                                                    WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                                                    t1.urlwsmysql = '${bdmysql}' and
                                                    t1.status = 'A'`);
                const monedas = yield database_1.db.query(`Select * from monedas`);
                //console.log(series);
                const configuracionSolped = {
                    series,
                    items,
                    cuentas,
                    impuestos,
                    //almacenes,
                    proveedores,
                    areas,
                    dependenciasUsuario,
                    almacenesUsuario,
                    monedas
                };
                return res.json(configuracionSolped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    configSolpedMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const series = yield database_1.db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='1470000113'`);
                const items = yield database_1.db.query(`SELECT DISTINCT t1.*
                                            FROM ${bdmysql}.presupuestoventa t0 
                                            INNER JOIN  ${bdmysql}.items_sap t1 ON t0.itemcode = t1.ItemCode
                                            WHERE t1.validFor='Y'
                                            ORDER BY t1.ItemName ASC`);
                const cuentas = yield database_1.db.query(`Select * From ${bdmysql}.cuentas_contable`);
                const impuestos = yield database_1.db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y'`);
                const proveedores = yield database_1.db.query(`Select * From ${bdmysql}.socios_negocio t0 where t0.GroupName='Materia Prima'`);
                const almacenes = yield database_1.db.query(`Select WhsCode_Code as "WarehouseCode",
                                                    WhsName as "WarehouseName",
                                                    Location_Code,
                                                    Location,
                                                    State_Code as "State",
                                                    Name_State,
                                                    Country_Code,
                                                    Name_Country,
                                                    Address2,
                                                    Address3
                                            From ${bdmysql}.almacenes`);
                const areas = yield database_1.db.query(`Select area 
                                                From areas_user t0 
                                                INNER JOIN companies t1 ON t0.companyid = t1.id
                                                where t1.status ='A' and
                                                    t1.urlwsmysql = '${bdmysql}' and
                                                    t0.codusersap = '${infoUsuario[0].codusersap}'`);
                const dependenciasUsuario = yield database_1.db.query(`SELECT dependence, location, vicepresidency  
                                                        FROM dependencies_user t0
                                                        INNER JOIN companies t1 ON t1.id = t0.companyid 
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                                                                t1.urlwsmysql = '${bdmysql}' and
                                                                t1.status = 'A'`);
                /*const almacenesUsuario = await db.query(`SELECT store
                                                        FROM stores_users t0
                                                        INNER JOIN companies t1 ON t0.companyid = t1.id
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and
                                                        t1.urlwsmysql = '${bdmysql}' and
                                                        t1.status = 'A'`);*/
                /*const almacenesUsuario = await db.query(`SELECT t0.store, CONCAT(t0.store,' - ',t2.WhsName) AS "label"
                                                        FROM stores_users t0
                                                        INNER JOIN companies t1 ON t0.companyid = t1.id
                                                        INNER JOIN ${bdmysql}.almacenes t2 ON t2.WhsCode_Code = t0.store
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and
                                                        t1.urlwsmysql = '${bdmysql}' and
                                                        t1.status = 'A'`);*/
                const monedas = yield database_1.db.query(`Select * from monedas`);
                const zonas = yield database_1.db.query(`Select Distinct 
                                                     State_Code as "State",
                                                     Name_State as "PENTRADA"
                                              From ${bdmysql}.almacenes
                                              Where State_Code !=''`);
                //console.log(series);
                const configuracionSolped = {
                    series,
                    items,
                    cuentas,
                    impuestos,
                    almacenes,
                    proveedores,
                    areas,
                    dependenciasUsuario,
                    //almacenesUsuario,
                    monedas,
                    zonas
                };
                return res.json(configuracionSolped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    series(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                let { objtype } = req.params;
                const series = yield database_1.db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='${objtype}'`);
                //console.log(series);
                return res.json(series);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    items(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const perfilesUsuario = yield helpers_1.default.getPerfilesUsuario(decodedToken.userId);
                const items = yield database_1.db.query(`SELECT *
                            FROM ${bdmysql}.items_sap t0
                            ORDER BY t0.ItemName ASC`);
                //console.log(items);
                res.json(items);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    itemsCalculadora(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const perfilesUsuario = yield helpers_1.default.getPerfilesUsuario(decodedToken.userId);
                const items = yield database_1.db.query(`SELECT DISTINCT t1.*
                                            FROM ${bdmysql}.presupuestoventa t0 
                                            INNER JOIN  ${bdmysql}.items_sap t1 ON t0.itemcode = t1.ItemCode
                                            ORDER BY t1.ItemName ASC`);
                //console.log(items);
                res.json(items);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cuentas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const cuentas = yield database_1.db.query(`Select * From ${bdmysql}.cuentas_contable`);
                return res.json(cuentas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    impuestosCompra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const impuestos = yield database_1.db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y'`);
                return res.json(impuestos);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    almacenes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const almacenes = yield database_1.db.query(`Select WhsCode_Code as "WarehouseCode",
                                                     WhsName as "WarehouseName",
                                                     Location_Code,
                                                     Location,
                                                     State_Code as "State",
                                                     Name_State,
                                                     Country_Code,
                                                     Name_Country,
                                                     Address2,
                                                     Address3
                                              From ${bdmysql}.almacenes`);
                return res.json(almacenes);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    zonas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const zonas = yield database_1.db.query(`Select Distinct 
                                                     State_Code as "State",
                                                     Name_State as "PENTRADA"
                                              From ${bdmysql}.almacenes
                                              Where State_Code !=''`);
                return res.json(zonas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    sociosNegocio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const proveedores = yield database_1.db.query(`Select * From ${bdmysql}.socios_negocio t0`);
                return res.json(proveedores);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    areasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `Select area 
            From areas_user t0 
            INNER JOIN companies t1 ON t0.companyid = t1.id
            where t1.status ='A' and
                  t1.urlwsmysql = '${bdmysql}' and
                  t0.codusersap = '${infoUsuario[0].codusersap}'`;
                const areas = yield database_1.db.query(query);
                //console.log(query);
                return res.json(areas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    dependeciasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT dependence, location, vicepresidency  
            FROM dependencies_user t0
            INNER JOIN companies t1 ON t1.id = t0.companyid 
            WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                  t1.urlwsmysql = '${bdmysql}' and
                  t1.status = 'A'`;
                //console.log(query);      
                const dependenciasUsuario = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(dependenciasUsuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    almacenesUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const almacenesUsuario = yield database_1.db.query(`SELECT store 
                                                        FROM stores_users t0 
                                                        INNER JOIN companies t1 ON t0.companyid = t1.id
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                                                        t1.urlwsmysql = '${bdmysql}' and
                                                        t1.status = 'A'`);
                res.json(almacenesUsuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cuentasDependencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                let dependencia = req.params.dependencia;
                //console.log(dependencia);
                const cuentas = yield database_1.db.query(`Select *
                                            From ${bdmysql}.cuentas_dependencias t0 
                                            Where t0.Code='${dependencia}'`);
                return res.json(cuentas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    monedas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `Select * from monedas`;
                //console.log(query);      
                const monedas = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(monedas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const mysqlQueriesController = new MySQLController();
exports.default = mysqlQueriesController;
