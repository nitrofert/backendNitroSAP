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
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const moment_1 = __importDefault(require("moment"));
class MrpController {
    zonas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let inventarios = yield helpers_1.default.getInventariosMPXE(infoUsuario[0]);
                let zonas = [];
                let lineas = [];
                for (let item in inventarios) {
                    lineas.push(inventarios[item]);
                }
                let linea;
                for (let item of lineas) {
                    ////console.logitem);
                    if (zonas.filter(item2 => item2.State == item.State).length === 0) {
                        linea = { State: item.State, 'PENTRADA': item.PENTRADA };
                        zonas.push(linea);
                    }
                }
                console.log(zonas);
                res.json(zonas);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    inventarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { item, zona } = req.body;
                //console.logreq.body);
                //Obtener inventarios de SAP  de Materia prima a granel y en producto terminado Simple
                //let inventarios = await helper.getInventariosMPXE(infoUsuario[0]);
                let inventarios = yield helpers_1.default.getInventariosItemMPXE(infoUsuario[0], item, zona);
                /*
                let inventariosItem = await helper.getInventariosItemMPXE(infoUsuario[0],item,zona);
                let array_inventariosItem :any[] =  [];
                for(let item in inventariosItem) {
                    array_inventariosItem.push(inventariosItem[item]);
                }
                console.log(array_inventariosItem.length);
                */
                let array_inventarios = [];
                for (let item in inventarios) {
                    array_inventarios.push(inventarios[item]);
                }
                console.log(array_inventarios.length);
                //Inventario de Materia prima  a granel
                /*let inventarioMP:any = array_inventarios.filter( (infoItem: {
                                                                    State: any;  ItemCode: any;
                                                                    INVENTARIO: string;
                                                                  })=>infoItem.INVENTARIO ==='MP' && infoItem.ItemCode === item  && infoItem.State === zona);*/
                let inventarioMP = array_inventarios.filter((infoItem) => infoItem.INVENTARIO === 'MP');
                //console.loginventarioMP);
                let totalInvMP = 0;
                for (let item of inventarioMP) {
                    totalInvMP = totalInvMP + eval(item.OnHand);
                }
                //Inventario de Materia prima en producto terminado simple            
                /*let inventarioPT:any = array_inventarios.filter( (infoItem: {
                                                                    State: any;  ItemCode: any;
                                                                    INVENTARIO: string;
                                                                  })=>infoItem.INVENTARIO ==='PT' && infoItem.ItemCode === item  && infoItem.State === zona);*/
                let inventarioPT = array_inventarios.filter((infoItem) => infoItem.INVENTARIO === 'PT');
                //console.loginventarioPT);
                let totalInvPT = 0;
                for (let item of inventarioPT) {
                    totalInvPT = totalInvPT + eval(item.OnHand);
                }
                let totalInventario = {
                    inventarioMP: totalInvMP,
                    ubicacionInvetarioMP: inventarioMP,
                    inventarioPT: totalInvPT,
                    ubicacionInvetarioPT: inventarioPT
                };
                //console.logtotalInventario);
                res.json(totalInventario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    inventariosTracking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let { item, zona, fechainicio, fechafin } = req.body;
                //let proveedores = await helper.objectToArray(await helper.getProveedoresXE(infoUsuario[0]));
                ////console.logproveedores);
                //Obtener invetarios de Materia prima en transito que esten en una solped/OC en SAP
                //let inventarios = await helper.getInventariosTrackingMPXE(infoUsuario[0]);
                let inventarios = yield helpers_1.default.getInventariosTrackingItemMPXE(infoUsuario[0], item, zona);
                let array_inventarios = [];
                for (let linea in inventarios) {
                    array_inventarios.push(inventarios[linea]);
                }
                ////console.logreq.body);
                //Inventario de materia prima en transito que esta en una orden de compra que su estatus es diferente a descargado
                /*let inventarioItemTransito = await array_inventarios.filter(data=>data.TIPO ==='Compra' &&
                data.State_Code === zona &&
                data.ItemCode === item  &&
                new Date(data.ETA) >= new Date(fechainicio) &&
                new Date(data.ETA) <= new Date(fechafin) &&
                data.U_NF_STATUS != 'Descargado');*/
                let inventarioItemTransito = yield array_inventarios.filter(data => data.TIPO === 'Compra' && new Date(data.ETA) >= new Date(fechainicio) && new Date(data.ETA) <= new Date(fechafin) && data.U_NF_STATUS != 'Descargado');
                ////console.log'TRANSITO',inventarioItemTransito);
                //Inventario de materia prima en transito abierta con fecha anterior a la fecha de inicio calculadora
                /*let inventarioItemTransitoPreFecha = array_inventarios.filter(data=>data.TIPO ==='Compra' &&
                data.State_Code === zona &&
                data.ItemCode === item  &&
                new Date(data.ETA) < new Date(fechainicio) &&
                data.U_NF_STATUS != 'Descargado');*/
                let inventarioItemTransitoPreFecha = array_inventarios.filter(data => data.TIPO === 'Compra' && new Date(data.ETA) < new Date(fechainicio) && data.U_NF_STATUS != 'Descargado');
                ////console.log'TRANSITOPRE',inventarioItemTransitoPreFecha);
                ////console.log'inventarioItemTransitoPreFecha',inventarioItemTransitoPreFecha);
                //Inventario de materia prima en transito que esta en una OC que su estatus es descargado en ZF
                /*let inventarioItemZF = array_inventarios.filter(data=>data.TIPO ==='Compra' &&
                data.State_Code === zona &&
                data.ItemCode === item  &&
                //new Date(data.ETA) >= new Date(fechainicio) &&
                //new Date(data.ETA) <= new Date(fechafin) &&
                data.U_NF_STATUS == 'Descargado');*/
                //Se elimina el inventario en Zona Franca por petición de Christan Freire
                //let inventarioItemZF = array_inventarios.filter(data=>data.TIPO ==='Compra' && data.U_NF_STATUS == 'Descargado');
                let inventarioItemZF = [];
                let totalInventarioItemZF = 0;
                if (inventarioItemZF.length > 0) {
                    for (let item of inventarioItemZF) {
                        totalInventarioItemZF = totalInventarioItemZF + eval(item.OpenCreQty);
                    }
                }
                //Inventario de materia prima que esta en una solped
                /*let inventarioItenSolicitado = array_inventarios.filter(data=>data.TIPO ==='Necesidad' &&
                data.State_Code === zona &&
                data.ItemCode === item  &&
                new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                new Date(data.FECHANECESIDAD) <= new Date(fechafin));*/
                let inventarioItenSolicitado = array_inventarios.filter(data => data.TIPO === 'Necesidad' &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                //Inventario de materia prima  que esta en una solped abierta con fecha anterior a la fecha de inicio calculadora
                /*let inventarioItenSolicitadoPreFecha = array_inventarios.filter(data=>data.TIPO ==='Necesidad' &&
                data.State_Code === zona &&
                data.ItemCode === item  &&
                new Date(data.FECHANECESIDAD) < new Date(fechainicio));*/
                let inventarioItenSolicitadoPreFecha = array_inventarios.filter(data => data.TIPO === 'Necesidad' && new Date(data.FECHANECESIDAD) < new Date(fechainicio));
                ////console.log'inventarioItenSolicitadoPreFecha',inventarioItenSolicitadoPreFecha);
                //Obtener compras proyectadas de materia prima en Mysql Portal
                let comprasProyectadas = yield helpers_1.default.getInventariosProyectados(infoUsuario[0]);
                //console.log(zona,item,fechainicio,fechafin,comprasProyectadas);
                let comprasProyectadasMP = comprasProyectadas.filter((data) => data.TIPO === 'Proyectado' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                ////console.log'comprasProyectadasMP',comprasProyectadasMP);
                let consolidadoInventarios = {
                    inventarioItemTransito,
                    inventarioItemTransitoPreFecha,
                    totalInventarioItemZF,
                    inventarioItenSolicitado,
                    inventarioItenSolicitadoPreFecha,
                    inventarioItemZF,
                    comprasProyectadasMP
                };
                ////console.logconsolidadoInventarios);
                res.json(consolidadoInventarios);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    presupuestosVenta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa Order by fechasemana ASC`;
                let presupuesto = yield database_1.db.query(queryList);
                //console.log'Presupuesto',presupuesto);
                res.json(presupuesto);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    presupuestosVentaItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let { item, zona, fechainicio, fechafin } = req.body;
                let fechaI = new Date(fechainicio);
                let fechaF = new Date(fechafin);
                let fechaIMoment = (0, moment_1.default)(fechainicio);
                //console.logfechaIMoment.week());
                //console.logmoment().isoWeek(fechaIMoment.week()).startOf('isoWeek'));
                ////console.logfechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate());
                ////console.logfechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate());
                let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa 
                                      WHERE  itemcode = '${item}' AND 
                                             codigozona = '${zona}' AND 
                                             fechasemana BETWEEN '${fechaI.getFullYear() + "-" + (fechaI.getMonth() + 1) + "-" + fechaI.getDate()}' AND 
                                                                 '${fechaF.getFullYear() + "-" + (fechaF.getMonth() + 1) + "-" + fechaF.getDate()}'`;
                let presupuesto = yield database_1.db.query(queryList);
                //console.log'Presupuesto',queryList,presupuesto);
                res.json(presupuesto);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    maxminItemZona(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let { item, zona } = req.body;
                //console.logreq.body);
                let queryList = `SELECT * FROM  ${bdmysql}.maxminitems WHERE itemcode = '${item}' AND zona = '${zona}'`;
                //console.logqueryList);
                let maxminresult = yield database_1.db.query(queryList);
                ////console.loginventarios);
                res.json(maxminresult);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    maxmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                ////console.logreq.body);
                let queryList = `SELECT * FROM  ${bdmysql}.maxminitems`;
                //console.logqueryList);
                let maxminresult = yield database_1.db.query(queryList);
                ////console.loginventarios);
                res.json(maxminresult);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    grabarSimulaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let data = req.body;
                ////console.logdata);
                let itemcode = data.simulacionConProyeciones[0].itemcode;
                let codigozona = data.simulacionConProyeciones[0].codigozona;
                let zona = data.simulacionConProyeciones[0].zona;
                //Borrar datos de la tabla de simulaciones para el item, zona
                let queryDeleteSimulaciones = `DELETE FROM ${bdmysql}.simulaciones_item_zona WHERE itemcode = ? and codigozona = ?`;
                let resultDelete = yield database_1.db.query(queryDeleteSimulaciones, [itemcode, codigozona]);
                let lineaSimulacion = [];
                let simulacionDet = [];
                for (let item in data.simulacionConProyeciones) {
                    lineaSimulacion.push(data.simulacionConProyeciones[item].itemcode);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].codigozona);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].itemname);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].zona);
                    lineaSimulacion.push(new Date(data.simulacionConProyeciones[item].fecha));
                    lineaSimulacion.push(data.simulacionConProyeciones[item].semana);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].semanames);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioMP);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioMPPT);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioMPZF);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioTransito);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioSolped);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioProyecciones);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].presupuestoConsumo);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioFinal);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].necesidadCompra);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].cantidadSugerida);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].inventarioFinalSugerido);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].tipo);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].tolerancia);
                    lineaSimulacion.push(data.simulacionConProyeciones[item].bodega);
                    simulacionDet.push(lineaSimulacion);
                    lineaSimulacion = [];
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].itemcode);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].codigozona);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].itemname);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].zona);
                    lineaSimulacion.push(new Date(data.simulacionSinProyeciones[item].fecha));
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].semana);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].semanames);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioMP);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioMPPT);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioMPZF);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioTransito);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioSolped);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioProyecciones);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].presupuestoConsumo);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioFinal);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].necesidadCompra);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].cantidadSugerida);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].inventarioFinalSugerido);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].tipo);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].tolerancia);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].bodega);
                    simulacionDet.push(lineaSimulacion);
                    lineaSimulacion = [];
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].itemcode);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].codigozona);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].itemname);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].zona);
                    lineaSimulacion.push(new Date(data.simulacionSinTransitoMP[item].fecha));
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].semana);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].semanames);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioMP);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioMPPT);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioMPZF);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioTransito);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioSolped);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioProyecciones);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].presupuestoConsumo);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioFinal);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].necesidadCompra);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].cantidadSugerida);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].inventarioFinalSugerido);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].tipo);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].tolerancia);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].bodega);
                    simulacionDet.push(lineaSimulacion);
                    lineaSimulacion = [];
                }
                ////console.logsimulacionDet);
                let queryInsertSimulaciones = `INSERT INTO ${bdmysql}.simulaciones_item_zona (itemcode,
                                                                                         codigozona,
                                                                                         itemname,
                                                                                         zona,
                                                                                         fecha,
                                                                                         semana,
                                                                                         semanames,
                                                                                         inventarioMP,
                                                                                         inventarioMPPT,
                                                                                         inventarioMPZF,
                                                                                         inventarioTransito,
                                                                                         inventarioSolped,
                                                                                         inventarioProyecciones,
                                                                                         presupuestoConsumo,
                                                                                         inventarioFinal,
                                                                                         necesidadCompra,
                                                                                         cantidadSugerida,
                                                                                         inventarioFinalSugerido,
                                                                                         tipo,
                                                                                         tolerancia,
                                                                                         bodega) values ?`;
                let resultInsert = yield database_1.db.query(queryInsertSimulaciones, [simulacionDet]);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente el registro de las simulaciones del item. ${itemcode} para la ${zona}`);
                res.json({ message: `Se realizo correctamnente el registro de las simulaciones del item. ${itemcode} para la ${zona}` });
                //res.json(msgResult);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cargarPresupuesto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFilePresupuesto = req.body;
                ////console.loginfoFilePresupuesto);
                let queryList = "";
                let queryRegistro = "";
                let lineasActualizadas = 0;
                let lineasRegistradas = 0;
                for (let linea of infoFilePresupuesto) {
                    //console.lognew Date(linea.fechasemana));
                    let fechasemana = new Date(linea.fechasemana);
                    queryList = `SELECT * 
                             FROM ${bdmysql}.presupuestoventa 
                             WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                   semana =${linea.semana} AND 
                                   itemcode = '${linea.itemcode}' AND 
                                   codigozona = '${linea.codigozona}'`;
                    ////console.logqueryList);
                    let result = yield database_1.db.query(queryList);
                    if (result.length > 0) {
                        //Actaliza linea
                        queryRegistro = `Update ${bdmysql}.presupuestoventa 
                                     SET cantidad = ${linea.cantidad.replace(',', '.')}
                                     WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                           semana =${linea.semana} AND 
                                           itemcode = '${linea.itemcode}' AND 
                                           codigozona = '${linea.codigozona}'`;
                        lineasActualizadas++;
                    }
                    else {
                        //Insertar nuevalinea
                        let fechasemanaFormat = yield helpers_1.default.format(linea.fechasemana);
                        queryRegistro = `INSERT INTO ${bdmysql}.presupuestoventa (fechasemana,semana,itemcode,codigozona,cantidad) 
                                                                      values ('${fechasemanaFormat}',${linea.semana},'${linea.itemcode}','${linea.codigozona}',${linea.cantidad.replace(',', '.')})`;
                        lineasRegistradas++;
                    }
                    ////console.logqueryRegistro);
                    let resultRegistro = yield database_1.db.query(queryRegistro);
                    //console.logresultRegistro);
                }
                let msgResult = {
                    message: `Se ha realizado el cargue del presupuesto correctamente. Se actualizaron ${lineasActualizadas} lineas del presupuesto y se registraron ${lineasRegistradas} lineas nuevas `
                };
                res.json(msgResult);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cargarPresupuesto2(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFilePresupuesto = req.body;
                let anexo = {
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path
                };
                //console.loganexo);
                //console.logfs.existsSync(anexo.ruta));
                let msgResult;
                if (fs_1.default.existsSync(anexo.ruta)) {
                    let results = [];
                    fs_1.default.createReadStream(anexo.ruta)
                        .pipe((0, csv_parser_1.default)({ separator: infoFilePresupuesto.separador }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        ////console.logresults);
                        // [
                        //   { NAME: 'Daffy Duck', AGE: '24' },
                        //   { NAME: 'Bugs Bunny', AGE: '22' }
                        // ]
                        let queryList = "";
                        let queryRegistro = "";
                        let lineasActualizadas = 0;
                        let lineasRegistradas = 0;
                        for (let linea of results) {
                            //console.lognew Date(linea.FECHASEMANA));
                            let fechasemana = new Date(linea.FECHASEMANA);
                            queryList = `SELECT * 
                                    FROM ${bdmysql}.presupuestoventa 
                                    WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                        semana =${linea.SEMANA} AND 
                                        itemcode = '${linea.ITEM}' AND 
                                        codigozona = '${linea.CODIGOZONA}'`;
                            ////console.logqueryList);
                            let result = yield database_1.db.query(queryList);
                            if (result.length > 0) {
                                //Actaliza linea
                                queryRegistro = `Update ${bdmysql}.presupuestoventa 
                                            SET cantidad = ${linea.CANTIDAD.replace(',', '.')}
                                            WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                                semana =${linea.SEMANA} AND 
                                                itemcode = '${linea.ITEM}' AND 
                                                codigozona = '${linea.CODIGOZONA}'`;
                                lineasActualizadas++;
                            }
                            else {
                                //Insertar nuevalinea
                                let fechasemanaFormat = yield helpers_1.default.format(linea.FECHASEMANA);
                                queryRegistro = `INSERT INTO ${bdmysql}.presupuestoventa (fechasemana,semana,itemcode,codigozona,cantidad) 
                                                                            values ('${fechasemanaFormat}',${linea.SEMANA},'${linea.ITEM}','${linea.CODIGOZONA}',${linea.CANTIDAD.replace(',', '.')})`;
                                lineasRegistradas++;
                            }
                            ////console.logqueryRegistro);
                            let resultRegistro = yield database_1.db.query(queryRegistro);
                            ////console.logresultRegistro);
                        }
                        msgResult = {
                            message: `Se ha realizado el cargue del presupuesto correctamente. Se actualizaron ${lineasActualizadas} lineas del presupuesto y se registraron ${lineasRegistradas} lineas nuevas `
                        };
                        res.json(msgResult);
                    }));
                }
                else {
                    msgResult = {
                        message: `No se ha cargado el archivo de presupuesto`
                    };
                    res.json(msgResult);
                }
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cargarMaxMin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFileaxMin = req.body;
                ////console.loginfoFilePresupuesto);
                let queryList = "";
                let queryRegistro = "";
                let lineasActualizadas = 0;
                let lineasRegistradas = 0;
                for (let linea of infoFileaxMin) {
                    //console.lognew Date(linea.fechasemana));
                    let fechasemana = new Date(linea.fechasemana);
                    queryList = `SELECT * 
                             FROM ${bdmysql}.maxminitems 
                             WHERE itemcode = '${linea.itemcode}' AND 
                                   zona = '${linea.codigozona}'`;
                    ////console.logqueryList);
                    let result = yield database_1.db.query(queryList);
                    if (result.length > 0) {
                        //Actaliza linea
                        queryRegistro = `Update ${bdmysql}.maxminitems 
                                     SET minimo = ${linea.minimo.replace(',', '.')}, maximo = ${linea.maximo.replace(',', '.')}
                                     WHERE itemcode = '${linea.itemcode}' AND 
                                           zona = '${linea.codigozona}'`;
                        lineasActualizadas++;
                    }
                    else {
                        //Insertar nuevalinea
                        let fechasemanaFormat = yield helpers_1.default.format(linea.fechasemana);
                        queryRegistro = `INSERT INTO ${bdmysql}.maxminitems (itemcode,zona,minimo,maximo) 
                                                                      values ('${linea.itemcode}','${linea.codigozona}',${linea.minimo.replace(',', '.')},${linea.maximo.replace(',', '.')})`;
                        lineasRegistradas++;
                    }
                    ////console.logqueryRegistro);
                    let resultRegistro = yield database_1.db.query(queryRegistro);
                    //console.logresultRegistro);
                }
                let msgResult = {
                    message: `Se ha realizado el cargue de los máximos y mínimos correctamente. Se actualizaron ${lineasActualizadas} lineas  y se registraron ${lineasRegistradas} lineas nuevas `
                };
                res.json(msgResult);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const mrpController = new MrpController();
exports.default = mrpController;
