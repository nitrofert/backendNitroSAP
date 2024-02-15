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
                const impuestos = yield database_1.db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y' and Inactivo='N'`);
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
                const impuestos = yield database_1.db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y' and Inactivo='N'`);
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
                                            From ${bdmysql}.almacenes ORDER BY WarehouseName ASC`);
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
    configCalculadoraPrecios(req, res) {
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
                //const  items = await db.query(`SELECT * FROM ${bdmysql}.items_sap t0 WHERE t0.validFor='Y' and  ItmsGrpCod = 102 ORDER BY t0.ItemName ASC`);
                const allItemsCalculadoraPrecios = yield helpers_1.default.allItemsCalculadoraPrecios(infoUsuario[0]);
                //console.log(allItemsCalculadoraPrecios);
                //const itemsPT:any[] = await helper.objectToArray( await helper.getItemsMPCP(compania,102));
                const itemsPT = allItemsCalculadoraPrecios.filter((item) => item.ItmsGrpCod === 102);
                let categoriasPT = [];
                for (let itemPT of itemsPT) {
                    if (categoriasPT.filter(categoria => categoria.U_NF_Categoria === itemPT.U_NF_SubCategoria).length === 0) {
                        if (itemPT.U_NF_Categoria != null) {
                            categoriasPT.push({ U_NF_Categoria: itemPT.U_NF_SubCategoria, NOMBRECATEGORIA: itemPT.NOMBRESUBCATEGORIA });
                        }
                    }
                }
                categoriasPT.unshift({ U_NF_Categoria: "", NOMBRECATEGORIA: "" });
                //const itemsMP:any[] = await helper.objectToArray( await helper.getItemsMPCP(compania,101));
                const itemsMP = allItemsCalculadoraPrecios.filter((item) => item.ItmsGrpCod === 101);
                //const itemsEmpaque:any[] = await helper.objectToArray( await helper.getItemsMPCP(compania,103));
                const itemsEmpaque = allItemsCalculadoraPrecios.filter((item) => item.ItmsGrpCod === 103);
                //const items = itemsPT.filter(item=>item.INACTIVO=="N");
                const items = itemsPT.filter(item => item.validFor == "Y");
                //const itemsMP2 = itemsMP.filter(item=>item.INACTIVO=="N");
                const itemsMP2 = itemsMP.filter(item => item.validFor == "Y");
                //const itemsEmpaqueMP2 = itemsEmpaque.filter(item=>item.INACTIVO=="N");
                const itemsEmpaqueMP2 = itemsEmpaque.filter(item => item.validFor == "Y");
                //console.log(itemsMP);
                const monedas = yield database_1.db.query(`Select * from monedas`);
                const zonas = yield database_1.db.query(`Select Distinct 
                                                     State_Code as "State",
                                                     Name_State as "PENTRADA"
                                              From ${bdmysql}.almacenes
                                              Where State_Code !=''`);
                const parametros_calculadora_precio = yield database_1.db.query(`Select * from ${bdmysql}.parametros_calc`);
                const tabla_costos_localidad = yield database_1.db.query(`Select * from ${bdmysql}.costos_localidad`);
                console.log(tabla_costos_localidad);
                const tabla_promedios_localidad = yield database_1.db.query(`Select AVG(costo_admin) AS promedio_administracion, AVG(costo_recurso) AS promedio_recurso from ${bdmysql}.costos_localidad where localidad!='ESPLACOL' AND localidad!='Granulación_Minerval' AND localidad!='Granulación_Nitrocaribe'`);
                console.log(tabla_promedios_localidad);
                const tabla_presentacion_items = yield database_1.db.query(`Select * from ${bdmysql}.presentacion_item_pt`);
                const tabla_precios_sugeridos = yield database_1.db.query(`Select * from ${bdmysql}.lista_precios_sugerida`);
                const tabla_precios_venta_sap = yield database_1.db.query(`Select * from ${bdmysql}.precio_venta_sap_l2w`);
                const tabla_recetas_items_pt = yield database_1.db.query(`Select * from ${bdmysql}.recetas_item_pt`);
                const tabla_lista_precios_sap = yield database_1.db.query(`Select * from ${bdmysql}.lista_precios_sap_pt`);
                const tabla_precios_pt_zona = yield database_1.db.query(`Select * from ${bdmysql}.lista_precios_pt_zona`);
                const tabla_lista_precios_mp = yield database_1.db.query(`SELECT anio, semanaAnioLista, precioNac, ItemCode FROM ${bdmysql}.lista_precios_mp GROUP BY anio, semanaAnioLista, precioNac,ItemCode ORDER BY anio DESC, semanaAnioLista DESC`);
                const configuracionSolped = {
                    //series,
                    items,
                    itemsMP2,
                    itemsEmpaqueMP2,
                    //cuentas,
                    //impuestos,
                    //almacenes,
                    //proveedores,
                    //areas,
                    //dependenciasUsuario,
                    //almacenesUsuario,
                    monedas,
                    zonas,
                    parametros_calculadora_precio,
                    tabla_costos_localidad,
                    tabla_promedios_localidad,
                    tabla_presentacion_items,
                    categoriasPT,
                    tabla_precios_sugeridos,
                    tabla_precios_venta_sap,
                    tabla_recetas_items_pt,
                    tabla_lista_precios_sap,
                    tabla_precios_pt_zona,
                    tabla_lista_precios_mp
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
    itemsMP(req, res) {
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
                            WHERE t0.ItemCode LIKE 'MP%' OR t0.ItemCode LIKE 'IN%'
                            ORDER BY t0.ItemName DESC`);
                //console.log(items);
                res.json(items);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    itemsPT(req, res) {
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
                const perfilesUsuario = yield helpers_1.default.getPerfilesUsuario(decodedToken.userId);
                /*const  items = await db.query(`SELECT *
                                FROM ${bdmysql}.items_sap t0
                                WHERE t0.ItemCode LIKE 'MP%' OR t0.ItemCode LIKE 'IN%'
                                ORDER BY t0.ItemName DESC`);*/
                const itemsMP = yield helpers_1.default.objectToArray(yield helpers_1.default.getItemsMPCP(compania, 102));
                const items = itemsMP.filter(item => item.INACTIVO == "N");
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
                console.log(dependencia);
                let where = "";
                if (dependencia) {
                    where = ` Where t0.Code='${dependencia}' `;
                }
                let sql = `Select * From ${bdmysql}.cuentas_dependencias t0 ${where} Order by t0.Code ASC`;
                console.log(sql);
                const cuentas = yield database_1.db.query(`Select * From ${bdmysql}.cuentas_dependencias t0 ${where} Order by t0.Code ASC`);
                console.log(cuentas);
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
    historial_trm_monedas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT t0.*, t1.Code FROM trm_dia_monedas t0 INNER JOIN monedas t1 ON t0.monedaid = t1.id`;
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
    dependecias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT * FROM ${bdmysql}.dependencias`;
                //console.log(query);      
                const dependencias = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(dependencias);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    autores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT * FROM ${bdmysql}.autores order by autor asc`;
                //console.log(query);      
                const autores = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(autores);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listaPreciosCalculados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT DISTINCT t0.id, 
                            t0.fecha, 
                            t0.semanaAnio, 
                            t0.semanaMes, 
                            t0.ItemCode, 
                            t0.ItemName, 
                            t0.moneda,
                            t0.categoria,
                            CASE WHEN t0.categoria ='' THEN t1.promMercado ELSE 0 END AS "promMercado", 
                            t0.precioRef,
                            
                            CASE WHEN t0.categoria ='' THEN
                            CASE WHEN t0.precioRef ='LPGERENTE' THEN t1.precioGerente 
                            WHEN t0.precioRef ='LPVENDEDOR' THEN t1.precioVendedor
                            WHEN t0.precioRef ='LP' THEN t1.precioLP
                            END 
                            ELSE
                            '-'
                            END AS "precioBase",
                            CASE WHEN t0.categoria ='' THEN t1.brutoS0 ELSE 0 END AS "brutoS0", 
                            CASE WHEN t0.categoria ='' THEN t1.netoS0 ELSE 0 END AS "netoS0", 
                            CASE WHEN t0.categoria ='' THEN t1.brutoS1 ELSE 0 END AS "brutoS1", 
                            CASE WHEN t0.categoria ='' THEN t1.netoS1 ELSE 0 END AS "netoS1", 
                            CASE WHEN t0.categoria ='' THEN t1.brutoS2 ELSE 0 END AS "brutoS2", 
                            CASE WHEN t0.categoria ='' THEN t1.netoS2 ELSE 0 END AS "netoS2",
                            CASE WHEN t0.categoria ='' THEN t1.precioGerente ELSE 0 END AS "precioGerente",
                            CASE WHEN t0.categoria ='' THEN t1.precioVendedor ELSE 0 END AS "precioVendedor",
                            CASE WHEN t0.categoria ='' THEN t1.precioLP ELSE 0 END AS "precioLP",
                            CASE WHEN t0.categoria ='' THEN t1.brutoS0SAP ELSE 0 END AS "brutoS0SAP",
                            CASE WHEN t0.categoria ='' THEN t1.totalS0SAP ELSE 0 END AS "totalS0SAP",

                            CASE WHEN t0.categoria ='' THEN t1.costoVentaPTsemana0 ELSE 0 END AS "costoVentaPTsemana0",
                            CASE WHEN t0.categoria ='' THEN t1.costoTotalPTsemana0 ELSE 0 END AS "costoTotalPTsemana0",

                            CASE WHEN t0.categoria ='' THEN t1.costoVentaPTSAP ELSE 0 END AS "costoVentaPTSAP",
                            CASE WHEN t0.categoria ='' THEN t1.costoTotalPTSAP ELSE 0 END AS "costoTotalPTSAP",
                            t0.observacion,

                            CASE WHEN (CASE WHEN t0.categoria ='' THEN
                            CASE WHEN t0.precioRef ='LPGERENTE' THEN t1.precioGerente 
                            WHEN t0.precioRef ='LPVENDEDOR' THEN t1.precioVendedor
                            WHEN t0.precioRef ='LP' THEN t1.precioLP
                            END 
                            ELSE
                            '-'
                            END) ='-' THEN 0 
                            ELSE
                            ((CASE WHEN t0.categoria ='' THEN
                            CASE WHEN t0.precioRef ='LPGERENTE' THEN t1.precioGerente 
                            WHEN t0.precioRef ='LPVENDEDOR' THEN t1.precioVendedor
                            WHEN t0.precioRef ='LP' THEN t1.precioLP
                            END 
                            ELSE
                            '-'
                            END)/t0.trmMoneda)*(1-(CASE WHEN t0.categoria ='' THEN t1.brutoS0 ELSE 0 END))
                            END AS costoBrutoS0,
                            
                            CASE WHEN (CASE WHEN t0.categoria ='' THEN
                            CASE WHEN t0.precioRef ='LPGERENTE' THEN t1.precioGerente 
                            WHEN t0.precioRef ='LPVENDEDOR' THEN t1.precioVendedor
                            WHEN t0.precioRef ='LP' THEN t1.precioLP
                            END 
                            ELSE
                            '-'
                            END) ='-' THEN 0 
                            ELSE
                            ((CASE WHEN t0.categoria ='' THEN
                            CASE WHEN t0.precioRef ='LPGERENTE' THEN t1.precioGerente 
                            WHEN t0.precioRef ='LPVENDEDOR' THEN t1.precioVendedor
                            WHEN t0.precioRef ='LP' THEN t1.precioLP
                            END 
                            ELSE
                            '-'
                            END)/t0.trmMoneda)*(1-(CASE WHEN t0.categoria ='' THEN t1.netoS0 ELSE 0 END))
                            END AS costoNetoS0
                                
                            FROM ${bdmysql}.calculo_precio_item t0
                            INNER JOIN ${bdmysql}.detalle_precio_calculo_item t1 ON t1.id_calculo = t0.id
                            WHERE t1.linea=2 and estado='ACTIVO'`;
                //console.log(query);
                //console.log(query);      
                const preciosCalculados = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(preciosCalculados);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    areas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT * FROM ${bdmysql}.areas`;
                //console.log(query);      
                const areas = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(areas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    recetaItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const itemCode = req.params.item;
                const query = `SELECT * FROM ${bdmysql}.recetas_item_pt where Father = '${itemCode}'`;
                console.log(query);
                const recetaItem = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(recetaItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listaPreciosSAPItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const itemCode = req.params.item;
                const query = `SELECT * FROM ${bdmysql}.lista_precios_sap_pt where ItemCode = '${itemCode}'`;
                console.log(query);
                const listaPreciosSAPItem = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(listaPreciosSAPItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listaPreciosVentaSAPItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const itemCode = req.params.item;
                const query = `SELECT * FROM ${bdmysql}.precio_venta_sap_l2w where ItemCode = '${itemCode}'`;
                console.log(query);
                const listaPreciosVentasSAPItem = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(listaPreciosVentasSAPItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listaAgentesAduana(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const query = `SELECT * FROM ${bdmysql}.agentesaduana `;
                console.log(query);
                const agentes = yield database_1.db.query(query);
                //console.log(dependenciasUsuario);
                res.json(agentes);
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
