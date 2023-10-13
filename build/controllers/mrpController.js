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
                //console.log(inventarios);
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
                let totalCostoMP = 0;
                for (let item of inventarioMP) {
                    totalInvMP = totalInvMP + eval(item.OnHand);
                    totalCostoMP += eval(item.Costototal);
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
                    costoTotalMP: totalCostoMP / totalInvMP,
                    inventarioPT: totalInvPT,
                    ubicacionInvetarioPT: inventarioPT,
                    costoTotalPT: 0
                };
                console.log(totalInventario);
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
                console.log(fechaI.getFullYear() + "-" + (fechaI.getMonth() + 1) + "-" + fechaI.getDate());
                console.log(fechaF.getFullYear() + "-" + (fechaF.getMonth() + 1) + "-" + fechaF.getDate());
                let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa 
                                      WHERE  itemcode = '${item}' AND 
                                             codigozona = '${zona}' AND 
                                             fechasemana BETWEEN '${fechaI.getFullYear() + "-" + (fechaI.getMonth() + 1) + "-" + fechaI.getDate()}' AND 
                                                                 '${fechaF.getFullYear() + "-" + (fechaF.getMonth() + 1) + "-" + fechaF.getDate()}'`;
                console.log(queryList);
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
                //console.log(data);
                let itemcode = data.simulacionConProyeciones[0].itemcode;
                let codigozona = data.simulacionConProyeciones[0].codigozona;
                let zona = data.simulacionConProyeciones[0].zona;
                //Borrar datos de la tabla de simulaciones para el item, zona
                let queryDeleteSimulaciones = `DELETE FROM ${bdmysql}.simulaciones_item_zona WHERE itemcode = ? and codigozona = ?`;
                let resultDelete = yield database_1.db.query(queryDeleteSimulaciones, [itemcode, codigozona]);
                let lineaSimulacion = [];
                let simulacionDet = [];
                for (let item in data.simulacionConProyeciones) {
                    /*lineaSimulacion.push(data.simulacionConProyeciones[item].itemcode);
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
                    lineaSimulacion = [];*/
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
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].costoUnitarioInicialMP);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].costoUnitarioInventarioTRMPP);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].costoUnitarioInventarioComprasSol);
                    lineaSimulacion.push(data.simulacionSinProyeciones[item].costoUnitarioInventarioMPSemana);
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
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].costoUnitarioInicialMP);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].costoUnitarioInventarioTRMPP);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].costoUnitarioInventarioComprasSol);
                    lineaSimulacion.push(data.simulacionSinTransitoMP[item].costoUnitarioInventarioMPSemana);
                    simulacionDet.push(lineaSimulacion);
                    lineaSimulacion = [];
                    if (data.simulacionSinSolped.length > 0) {
                        lineaSimulacion.push(data.simulacionSinSolped[item].itemcode);
                        lineaSimulacion.push(data.simulacionSinSolped[item].codigozona);
                        lineaSimulacion.push(data.simulacionSinSolped[item].itemname);
                        lineaSimulacion.push(data.simulacionSinSolped[item].zona);
                        lineaSimulacion.push(new Date(data.simulacionSinSolped[item].fecha));
                        lineaSimulacion.push(data.simulacionSinSolped[item].semana);
                        lineaSimulacion.push(data.simulacionSinSolped[item].semanames);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioMP);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioMPPT);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioMPZF);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioTransito);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioSolped);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioProyecciones);
                        lineaSimulacion.push(data.simulacionSinSolped[item].presupuestoConsumo);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioFinal);
                        lineaSimulacion.push(data.simulacionSinSolped[item].necesidadCompra);
                        lineaSimulacion.push(data.simulacionSinSolped[item].cantidadSugerida);
                        lineaSimulacion.push(data.simulacionSinSolped[item].inventarioFinalSugerido);
                        lineaSimulacion.push(data.simulacionSinSolped[item].tipo);
                        lineaSimulacion.push(data.simulacionSinSolped[item].tolerancia);
                        lineaSimulacion.push(data.simulacionSinSolped[item].bodega);
                        lineaSimulacion.push(data.simulacionSinSolped[item].costoUnitarioInicialMP);
                        lineaSimulacion.push(data.simulacionSinSolped[item].costoUnitarioInventarioTRMPP);
                        lineaSimulacion.push(data.simulacionSinSolped[item].costoUnitarioInventarioComprasSol);
                        lineaSimulacion.push(data.simulacionSinSolped[item].costoUnitarioInventarioMPSemana);
                        simulacionDet.push(lineaSimulacion);
                        lineaSimulacion = [];
                    }
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
                                                                                         bodega,
                                                                                         costoUnitarioInicialMP,
                                                                                         costoUnitarioInventarioTRMPP,
                                                                                         costoUnitarioInventarioComprasSol,
                                                                                         costoUnitarioInventarioMPSemana) values ?`;
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
                console.log(infoFilePresupuesto);
                let queryList = "";
                let queryRegistro = "";
                let lineasActualizadas = 0;
                let lineasRegistradas = 0;
                for (let linea of infoFilePresupuesto) {
                    console.log(new Date(linea.fechasemana));
                    let fechasemana = new Date(linea.fechasemana);
                    queryList = `SELECT * 
                             FROM ${bdmysql}.presupuestoventa 
                             WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                   semana =${linea.semana} AND 
                                   itemcode = '${linea.itemcode}' AND 
                                   codigozona = '${linea.codigozona}'`;
                    console.log(queryList);
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
                    console.log(queryRegistro);
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
                                let fechasemanaFormat = yield helpers_1.default.formatDate(linea.FECHASEMANA);
                                console.log(linea.FECHASEMANA, fechasemanaFormat);
                                queryRegistro = `Update ${bdmysql}.presupuestoventa 
                                            SET cantidad = ${linea.CANTIDAD.replace(',', '.')}, fechasemana = '${linea.FECHASEMANA}'
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
                                                                            values ('${linea.FECHASEMANA}',${linea.SEMANA},'${linea.ITEM}','${linea.CODIGOZONA}',${linea.CANTIDAD.replace(',', '.')})`;
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
    grabarListaPreciosMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const dataListaPreciosMP = req.body;
                console.log(dataListaPreciosMP.lista);
                let lineaListaPrecio = [];
                for (let item of dataListaPreciosMP.lista) {
                    let query = `Select * from ${bdmysql}.lista_precios_mp where ItemCode='${item.ItemCode}' and semanaAnioLista=${dataListaPreciosMP.semanaAnioLista} and anio = ${(new Date(dataListaPreciosMP.fechaLista)).getFullYear()}`;
                    let existeItemSemana = yield database_1.db.query(query);
                    if (existeItemSemana.length == 0) {
                        //Insert fila
                        lineaListaPrecio.push(item.ItemCode);
                        lineaListaPrecio.push(item.ItemName);
                        lineaListaPrecio.push(new Date(dataListaPreciosMP.fechaLista));
                        lineaListaPrecio.push(dataListaPreciosMP.semanaMesLista);
                        lineaListaPrecio.push(dataListaPreciosMP.semanaAnioLista);
                        lineaListaPrecio.push(item.precioExt);
                        lineaListaPrecio.push(item.precioNac);
                        lineaListaPrecio.push(item.tendencia);
                        lineaListaPrecio.push((new Date(dataListaPreciosMP.fechaLista)).getFullYear());
                        let queryInsertListadoPreciosMP = `Insert into ${bdmysql}.lista_precios_mp (ItemCode,ItemName,fechaLista,semanaMesLista,semanaAnioLista,precioExt,precioNac,tendencia,anio) values (?)`;
                        let resultInsertSolpedDet = yield database_1.db.query(queryInsertListadoPreciosMP, [lineaListaPrecio]);
                        console.log(resultInsertSolpedDet);
                    }
                    else {
                        //Update fila
                        let queryUpdateListadoPreciosMP = `Update ${bdmysql}.lista_precios_mp set precioExt = ${item.precioExt} , precioNac= ${item.precioNac} , tendencia = '${item.tendencia}' where ItemCode='${item.ItemCode}' and semanaAnioLista=${dataListaPreciosMP.semanaAnioLista} and anio = ${(new Date(dataListaPreciosMP.fechaLista)).getFullYear()}`;
                        console.log(queryUpdateListadoPreciosMP);
                        let resultUpdateListadoPreciosMP = yield database_1.db.query(queryUpdateListadoPreciosMP);
                        console.log(resultUpdateListadoPreciosMP);
                    }
                    lineaListaPrecio = [];
                }
                res.json(true);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let query = `Select * from ${bdmysql}.lista_precios_mp ORDER BY anio, fechaLista, semanaAnioLista, ItemName ASC `;
                let listaPreciosMP = yield database_1.db.query(query);
                res.json(listaPreciosMP);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosMPSemana(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const semana = req.params.semana;
                let query = `Select * from ${bdmysql}.lista_precios_mp where semanaAnioLista=${semana}`;
                let itemsMPSemana = yield database_1.db.query(query);
                res.json(itemsMPSemana);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosSugeridosItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const item = req.params.item;
                let query = `Select * from ${bdmysql}.lista_precios_sugerida where ItemCode='${item}'`;
                let listaPreciosSugeridoItem = yield database_1.db.query(query);
                res.json(listaPreciosSugeridoItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    grabarListaPreciosPT(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const dataListaPreciosPT = req.body;
                console.log(dataListaPreciosPT.lista);
                let lineaListaPrecio = [];
                for (let item of dataListaPreciosPT.lista) {
                    let query = `Select * from ${bdmysql}.lista_precios_pt_zona 
                             where ItemCode='${item.ItemCode}' and 
                                   semanaAnioLista=${dataListaPreciosPT.semanaAnioLista} and 
                                   anio = ${(new Date(dataListaPreciosPT.fechaLista)).getFullYear()} and
                                   zona_venta = '${dataListaPreciosPT.zona_venta}' and 
                                   localidad = '${dataListaPreciosPT.localidad}' and 
                                   autor_id = ${dataListaPreciosPT.autor_id}`;
                    let existeItemSemana = yield database_1.db.query(query);
                    if (existeItemSemana.length == 0) {
                        //Insert fila
                        lineaListaPrecio.push(item.ItemCode);
                        lineaListaPrecio.push(item.ItemName);
                        lineaListaPrecio.push(new Date(dataListaPreciosPT.fechaLista));
                        lineaListaPrecio.push(dataListaPreciosPT.semanaMesLista);
                        lineaListaPrecio.push(dataListaPreciosPT.semanaAnioLista);
                        lineaListaPrecio.push(dataListaPreciosPT.localidad);
                        lineaListaPrecio.push(dataListaPreciosPT.zona_venta);
                        lineaListaPrecio.push(dataListaPreciosPT.autor_id);
                        lineaListaPrecio.push((new Date(dataListaPreciosPT.fechaLista)).getFullYear());
                        lineaListaPrecio.push(item.precio);
                        console.log();
                        let queryInsertListadoPreciosPT = `Insert into ${bdmysql}.lista_precios_pt_zona (ItemCode,
                                                                                                     ItemName,
                                                                                                     fechaLista,
                                                                                                     semanaMesLista,
                                                                                                     semanaAnioLista,
                                                                                                     localidad,
                                                                                                     zona_venta,
                                                                                                     autor_id,
                                                                                                     anio,
                                                                                                     precio) values (?)`;
                        let resultInsertSolpedDet = yield database_1.db.query(queryInsertListadoPreciosPT, [lineaListaPrecio]);
                        console.log('insert', resultInsertSolpedDet);
                    }
                    else {
                        //Update fila
                        let queryUpdateListadoPreciosPT = `Update ${bdmysql}.lista_precios_pt_zona set precio = ${item.precio}  
                                                       where ItemCode='${item.ItemCode}' and 
                                                       semanaAnioLista=${dataListaPreciosPT.semanaAnioLista} and 
                                                       anio = ${(new Date(dataListaPreciosPT.fechaLista)).getFullYear()} and
                                                       zona_venta = '${dataListaPreciosPT.zona_venta}' and 
                                                       localidad = '${dataListaPreciosPT.localidad}' and 
                                                       autor_id = ${dataListaPreciosPT.autor_id}`;
                        console.log(queryUpdateListadoPreciosPT);
                        let resultUpdateListadoPreciosPT = yield database_1.db.query(queryUpdateListadoPreciosPT);
                        console.log(resultUpdateListadoPreciosPT);
                    }
                    lineaListaPrecio = [];
                }
                res.json(true);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosPT(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let query = `Select * 
                         from ${bdmysql}.lista_precios_pt_zona t0 
                         INNER JOIN ${bdmysql}.autores t1 ON t1.id = t0.autor_id 
                         ORDER BY anio, fechaLista, semanaAnioLista, ItemName, t1.autor ASC `;
                let listaPreciosPT = yield database_1.db.query(query);
                res.json(listaPreciosPT);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosPTSemana(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const semana = req.params.semana;
                let query = `Select * from ${bdmysql}.lista_precios_pt_zona where semanaAnioLista=${semana}`;
                let itemsPTSemana = yield database_1.db.query(query);
                res.json(itemsPTSemana);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosSugeridos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let query = `Select * 
                         from ${bdmysql}.lista_precios_sugerida t0 
                         ORDER BY ItemName ASC `;
                let listaPreciosSugeridos = yield database_1.db.query(query);
                res.json(listaPreciosSugeridos);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getListaPreciosItemSap(req, res) {
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
                const itemCode = req.params.itemcode;
                const listaPreciosItem = yield helpers_1.default.objectToArray(yield helpers_1.default.getListaPreciosItemSAP(compania, itemCode));
                //console.log(listaPreciosItem);
                res.json(listaPreciosItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getItemsMPbyItemPT(req, res) {
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
                const itemCode = req.params.itemcode;
                const itemsMP = yield helpers_1.default.objectToArray(yield helpers_1.default.getItemsMPbyItemPT(compania, itemCode));
                //console.log(listaPreciosItem);
                res.json(itemsMP);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getPreciosMPItemUltimasSemanas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { itemCode, semanaAnio, anio } = req.query;
                //console.log(itemCode, semanaAnio, anio);
                //Obtener el precio del item seleccionado de las ultimas tres semanas
                let query = `SELECT anio, semanaAnioLista, precioNac
                         FROM ${bdmysql}.lista_precios_mp 
                         WHERE ItemCode = '${itemCode}'
                         GROUP BY anio, semanaAnioLista, precioNac,ItemCode 
                         ORDER BY anio, semanaAnioLista DESC
                         LIMIT 3`;
                //let query = `Select * from ${bdmysql}.lista_precios_mp where semanaAnioLista=${semanaAnio} and anio =${anio} and ItemCode='${itemCode}'`;
                let itemMPSemana = yield database_1.db.query(query);
                res.json(itemMPSemana);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getPrecioMercadoItemSemana(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { itemCode, semanaAnio, anio, fechaInicio, fechaFin } = req.query;
                //console.log(itemCode, semanaAnio, anio);
                /*let query = `Select *
                             from ${bdmysql}.lista_precios_pt_zona
                             where
                                    semanaAnioLista=${semanaAnio} and
                                    anio =${anio} and
                                    ItemCode='${itemCode}'
                             
                             order by anio, semanaAnioLista,ItemName ASC`;*/
                let query = `Select * 
                         from ${bdmysql}.lista_precios_pt_zona 
                         where  anio =${anio} and 
                                ItemCode='${itemCode}' and 
                                fechaLista BETWEEN '${fechaInicio.split('T')[0]}' and '${fechaFin.split('T')[0]}'
                         
                         order by anio, semanaAnioLista,ItemName ASC`;
                console.log(query);
                let itemMPSemana = yield database_1.db.query(query);
                res.json(itemMPSemana);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    updateParametrosCalc(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { parametros, costos_localidad, presentacion_items } = req.body;
                console.log(req.body);
                let error = false;
                for (let parametro of parametros) {
                    console.log(parametro);
                    const updateParametro = yield database_1.db.query(`Update ${bdmysql}.parametros_calc set valor='${parametro.valor}' where codigo='${parametro.codigo}'`);
                    console.log(updateParametro);
                }
                for (let parametro of costos_localidad) {
                    console.log(parametro);
                    const updateParametro = yield database_1.db.query(`Update ${bdmysql}.costos_localidad set costo_admin=${parametro.costo_admin}, costo_recurso=${parametro.costo_recurso} where codigo='${parametro.codigo}'`);
                    console.log(updateParametro);
                }
                for (let parametro of presentacion_items) {
                    console.log(parametro);
                    const updateParametro = yield database_1.db.query(`Update ${bdmysql}.presentacion_item_pt set valor='${parametro.valor}' where id='${parametro.id}'`);
                    console.log(updateParametro);
                }
                res.json(error);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json(error);
            }
        });
    }
    getParametrosMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const parametros_calculadora_precio = yield database_1.db.query(`Select * from ${bdmysql}.parametros_calc`);
                res.json(parametros_calculadora_precio);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json(error);
            }
        });
    }
    nuevoAutor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { autor } = req.body;
                console.log(req.body);
                let error = false;
                let message = "";
                const existeAutor = yield database_1.db.query(`Select * from ${bdmysql}.autores where LOWER(autor)=LOWER('${autor}')`);
                if (existeAutor.length > 0) {
                    error = true;
                    message = "El nombre del autor ingresado ya existe";
                }
                else {
                    const nuevoAutor = yield database_1.db.query(`Insert into ${bdmysql}.autores (autor) values('${autor}')`);
                    message = "Se registro correctamente el autor";
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json(error);
            }
        });
    }
    cargarLPMercado(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFilePresupuesto = req.body;
                yield connection.beginTransaction();
                let anexo = {
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path
                };
                //console.loganexo);
                //console.logfs.existsSync(anexo.ruta));
                let msgResult;
                let mesesAnio = helpers_1.default.mesesAnio;
                if (fs_1.default.existsSync(anexo.ruta)) {
                    let results = [];
                    fs_1.default.createReadStream(anexo.ruta)
                        .pipe((0, csv_parser_1.default)({ separator: infoFilePresupuesto.separador }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        let queryList = "";
                        let queryRegistro = "";
                        let lineasActualizadas = 0;
                        let lineasRegistradas = 0;
                        let iterador = 1;
                        for (let linea of results) {
                            //console.log(linea);
                            //console.log(iterador,linea.FECHAINICIOSEMANA);
                            let fechasemana = new Date(linea.FECHAINICIOSEMANA);
                            let fechaInicioSemana = yield helpers_1.default.fechaInicioSemana(fechasemana);
                            let semanaMesLista = yield helpers_1.default.semanaDelMes(fechasemana);
                            let semanaAnio = yield helpers_1.default.numeroDeSemana(fechasemana);
                            console.log(fechasemana, fechasemana.getFullYear(), linea.SEMANAANIO, semanaAnio, semanaMesLista, linea.SEMANAMES);
                            queryList = `SELECT * 
                                     FROM ${bdmysql}.lista_precios_pt_zona 
                                     WHERE  anio=${fechasemana.getFullYear()} AND 
                                            semanaAnioLista =${linea.SEMANAANIO} AND 
                                            ItemCode = '${linea.ITEMCODE}' AND 
                                            zona_venta = '${linea.ZONAVENTA}' AND 
                                            localidad = '${linea.LOCALIDAD}' AND 
                                            autor_id = ${linea.AUTOR}`;
                            let result = yield database_1.db.query(queryList);
                            if (result.length > 0) {
                                //Actaliza linea
                                console.log('Update');
                                queryRegistro = `Update ${bdmysql}.lista_precios_pt_zona 
                                             SET precio = ${linea.PRECIO}
                                             WHERE   anio=${fechasemana.getFullYear()} AND 
                                                    semanaAnioLista =${linea.SEMANAANIO} AND 
                                                    ItemCode = '${linea.ITEMCODE}' AND 
                                                    zona_venta = '${linea.ZONAVENTA}' AND 
                                                    localidad = '${linea.LOCALIDAD}' AND 
                                                    autor_id = ${linea.AUTOR}`;
                                let resultUpdate = yield connection.query(queryRegistro);
                                console.log(resultUpdate);
                                lineasActualizadas++;
                            }
                            else {
                                //Insertar nuevalinea
                                console.log('Insert');
                                queryRegistro = `INSERT INTO ${bdmysql}.lista_precios_pt_zona (ItemCode,
                                                                                      ItemName,
                                                                                      fechaLista,
                                                                                      semanaMesLista,
                                                                                      semanaAnioLista,
                                                                                      anio,
                                                                                      localidad,
                                                                                      zona_venta,
                                                                                      precio,
                                                                                      autor_id) 
                                                                            values ('${linea.ITEMCODE}',
                                                                                    '${linea.ITEMNAME}',
                                                                                    '${linea.FECHAINICIOSEMANA}',
                                                                                    '${semanaMesLista}',
                                                                                     ${linea.SEMANAANIO},
                                                                                     ${fechasemana.getFullYear()},
                                                                                    '${linea.LOCALIDAD}',
                                                                                    '${linea.ZONAVENTA}',
                                                                                     ${linea.PRECIO},
                                                                                     ${linea.AUTOR})`;
                                let resultInsert = yield connection.query(queryRegistro);
                                console.log('resultInsert', resultInsert);
                                lineasRegistradas++;
                            }
                            iterador++;
                        }
                        yield connection.commit();
                        msgResult = {
                            message: `Se ha realizado el cargue de la lista de precios de productos con sus respectivos valores de mercado. Se actualizaron ${lineasActualizadas} lineas del listado y se registraron ${lineasRegistradas} lineas nuevas `
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
                console.error('ERROR ------>', error);
                yield connection.rollback();
                return res.status(501).json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    cargarLPSugerido(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFilePresupuesto = req.body;
                yield connection.beginTransaction();
                let anexo = {
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path
                };
                //console.loganexo);
                //console.logfs.existsSync(anexo.ruta));
                let msgResult;
                let mesesAnio = helpers_1.default.mesesAnio;
                if (fs_1.default.existsSync(anexo.ruta)) {
                    let results = [];
                    fs_1.default.createReadStream(anexo.ruta)
                        .pipe((0, csv_parser_1.default)({ separator: infoFilePresupuesto.separador }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        let queryList = "";
                        let queryRegistro = "";
                        let lineasActualizadas = 0;
                        let lineasRegistradas = 0;
                        let iterador = 1;
                        console.log(results);
                        for (let linea of results) {
                            //console.log(linea);
                            queryList = `SELECT * 
                                     FROM ${bdmysql}.lista_precios_sugerida 
                                     WHERE  ItemCode = '${linea.ITEMCODE}'`;
                            let result = yield database_1.db.query(queryList);
                            if (result.length > 0) {
                                //Actaliza linea
                                console.log('Update');
                                queryRegistro = `Update ${bdmysql}.lista_precios_sugerida 
                                             SET precioGerente = ${linea.PRECIOGERENTE},
                                                 precioVendedor = ${linea.PRECIOVENDEDOR},
                                                 precioLista = ${linea.PRECIOLISTA}
                                             WHERE   ItemCode = '${linea.ITEMCODE}'`;
                                let resultUpdate = yield connection.query(queryRegistro);
                                console.log(resultUpdate);
                                lineasActualizadas++;
                            }
                            else {
                                //Insertar nuevalinea
                                console.log('Insert');
                                queryRegistro = `INSERT INTO ${bdmysql}.lista_precios_sugerida (ItemCode,
                                                                                      ItemName,
                                                                                      precioGerente,
                                                                                      precioVendedor,
                                                                                      precioLista) 
                                                                            values ('${linea.ITEMCODE}',
                                                                                    '${linea.ITEMNAME}',
                                                                                    ${linea.PRECIOGERENTE},
                                                                                     ${linea.PRECIOVENDEDOR},
                                                                                     ${linea.PRECIOLISTA})`;
                                let resultInsert = yield connection.query(queryRegistro);
                                console.log('resultInsert', resultInsert);
                                lineasRegistradas++;
                            }
                            iterador++;
                        }
                        yield connection.commit();
                        msgResult = {
                            message: `Se ha realizado el cargue de la lista de precios de productos con sus respectivos valores sugeridos. Se actualizaron ${lineasActualizadas} lineas del listado y se registraron ${lineasRegistradas} lineas nuevas `
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
                console.error('ERROR ------>', error);
                yield connection.rollback();
                return res.status(501).json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    cargarLPMP(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                let infoFilePresupuesto = req.body;
                yield connection.beginTransaction();
                let anexo = {
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path
                };
                //console.loganexo);
                //console.logfs.existsSync(anexo.ruta));
                let msgResult;
                let mesesAnio = helpers_1.default.mesesAnio;
                if (fs_1.default.existsSync(anexo.ruta)) {
                    let results = [];
                    fs_1.default.createReadStream(anexo.ruta)
                        .pipe((0, csv_parser_1.default)({ separator: infoFilePresupuesto.separador }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        let parametros_cal = yield database_1.db.query(`SELECT * FROM ${bdmysql}.parametros_calc`);
                        let diasInteres = parametros_cal.filter(parametro => parametro.codigo === 'INTDIA')[0].valor;
                        let prcInteres = parametros_cal.filter(parametro => parametro.codigo === 'PRCINT')[0].valor;
                        let prcEntrega = parametros_cal.filter(parametro => parametro.codigo === 'PRCENT')[0].valor;
                        let queryList = "";
                        let queryRegistro = "";
                        let lineasActualizadas = 0;
                        let lineasRegistradas = 0;
                        let iterador = 1;
                        for (let linea of results) {
                            //console.log(linea);
                            let fechasemana = new Date(linea.FECHALISTA);
                            let fechaInicioSemana = yield helpers_1.default.fechaInicioSemana(fechasemana);
                            let semanaMesLista = yield helpers_1.default.semanaDelMes(fechasemana);
                            let semanaAnio = yield helpers_1.default.numeroDeSemana(fechasemana);
                            console.log(fechasemana, fechasemana.getFullYear(), linea.SEMANAANIO, semanaAnio, semanaMesLista);
                            let precioNac = parseFloat(linea.PRECIOEXT) + parseFloat(prcEntrega) + (parseFloat(linea.PRECIOEXT) * ((parseFloat(diasInteres) / 365) * parseFloat(prcInteres)));
                            queryList = `SELECT * 
                                     FROM ${bdmysql}.lista_precios_mp 
                                     WHERE  anio=${fechasemana.getFullYear()} AND 
                                            semanaAnioLista =${linea.SEMANAANIO} AND 
                                            ItemCode = '${linea.ITEMCODE}'`;
                            let result = yield database_1.db.query(queryList);
                            //console.log(queryList);
                            if (result.length > 0) {
                                //Actaliza linea
                                console.log('Update');
                                queryRegistro = `Update ${bdmysql}.lista_precios_mp 
                                             SET precioExt = ${linea.PRECIOEXT},
                                                 precioNac = ${precioNac},
                                                 fechaLista = '${linea.FECHALISTA}',
                                                 semanaMesLista = '${semanaMesLista}',
                                                 tendencia = '${linea.TENDENCIA}'
                                             WHERE   anio=${fechasemana.getFullYear()} AND 
                                                    semanaAnioLista =${linea.SEMANAANIO} AND 
                                                    ItemCode = '${linea.ITEMCODE}'`;
                                let resultUpdate = yield connection.query(queryRegistro);
                                console.log(resultUpdate);
                                lineasActualizadas++;
                            }
                            else {
                                //Insertar nuevalinea
                                console.log('Insert');
                                queryRegistro = `INSERT INTO ${bdmysql}.lista_precios_mp (ItemCode,
                                                                                      ItemName,
                                                                                      fechaLista,
                                                                                      semanaMesLista,
                                                                                      semanaAnioLista,
                                                                                      anio,
                                                                                      precioExt,
                                                                                      precioNac,
                                                                                      tendencia) 
                                                                            values ('${linea.ITEMCODE}',
                                                                                    '${linea.ITEMNAME}',
                                                                                    '${linea.FECHALISTA}',
                                                                                    '${semanaMesLista}',
                                                                                     ${linea.SEMANAANIO},
                                                                                     ${fechasemana.getFullYear()},
                                                                                     ${parseFloat(linea.PRECIOEXT)},
                                                                                     ${precioNac},
                                                                                     '${linea.TENDENCIA}')`;
                                let resultInsert = yield connection.query(queryRegistro);
                                console.log('resultInsert', resultInsert);
                                lineasRegistradas++;
                            }
                            iterador++;
                        }
                        yield connection.commit();
                        msgResult = {
                            message: `Se ha realizado el cargue de la lista de precios de materia prima con sus respectivos valores de mercado. Se actualizaron ${lineasActualizadas} lineas del listado y se registraron ${lineasRegistradas} lineas nuevas `
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
                console.error('ERROR ------>', error);
                yield connection.rollback();
                return res.status(501).json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    getPreciosPTxSemanaZonaAutor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { semanaAnioLista, anio, localidad, zona_venta, autor_id } = req.query;
                //console.log(itemCode, semanaAnio, anio);
                //Obtener el precio del item seleccionado de las ultimas tres semanas
                let queryList = `SELECT * 
                                     FROM ${bdmysql}.lista_precios_pt_zona 
                                     WHERE  anio=${anio} AND 
                                            semanaAnioLista =${semanaAnioLista} AND 
                                            zona_venta = '${zona_venta}' AND 
                                            localidad = '${localidad}' AND 
                                            autor_id = ${autor_id}`;
                // console.log(queryList);
                let itemsPTSemanaZonaAutor = yield database_1.db.query(queryList);
                res.json(itemsPTSemanaZonaAutor);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    grabarCalculoPreciosItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const { fecha, semanaAnio, semanaMes, ItemCode, ItemName, trmDia, moneda, trmMoneda, categoria, precioRef, precioBase, prcGerente, prcLP, prcVendedor, promAdmin, promRecurso, detalle_calculo_mp, detalle_calculo_precio_item, observacion, costoRecursoSAP } = req.body;
                console.log(detalle_calculo_precio_item);
                yield connection.beginTransaction();
                let error = false;
                let message = "";
                let fechaCalculo = fecha.split("T");
                const queryInsertCalculo = `Insert into ${bdmysql}.calculo_precio_item (fecha, userid,semanaAnio, semanaMes,ItemCode, ItemName, trmDia, moneda, trmMoneda,precioRef,
                                                                                    precioBase,prcGerente,prcLP,promAdmin,promRecurso,observacion,costoRecursoSAP,prcVendedor,categoria)
                                                                            values ('${fechaCalculo[0]}', 
                                                                                    ${infoUsuario[0].id},
                                                                                    ${semanaAnio}, 
                                                                                    '${semanaMes}',
                                                                                    '${ItemCode}', 
                                                                                    '${ItemName}', 
                                                                                    ${trmDia}, 
                                                                                    '${moneda}', 
                                                                                    ${trmMoneda},
                                                                                    '${precioRef}',
                                                                                    ${precioBase},
                                                                                    ${prcGerente},
                                                                                    ${prcLP},
                                                                                    ${promAdmin},
                                                                                    ${promRecurso},
                                                                                    '${observacion}',
                                                                                    ${costoRecursoSAP},
                                                                                    ${prcVendedor},
                                                                                    '${categoria}')`;
                const resultInsert = yield connection.query(queryInsertCalculo);
                const id_calculo = resultInsert.insertId;
                for (let line of detalle_calculo_mp) {
                    let fatherItemCode = line.itemMP.Father;
                    let ItemCode = line.itemMP.Code;
                    let ItemName = line.itemMP.ItemName;
                    let empaque = line.itemMP.EMPAQUE;
                    let cantidad = line.itemMP.Quantity;
                    let anioS0 = line.costosItemMP.semana0.anio;
                    let semanaS0 = line.costosItemMP.semana0.semana;
                    let costoMPS0 = line.costosItemMP.semana0.costoMP;
                    let costoEmpaqueS0 = line.costosItemMP.semana0.empaqueMP;
                    let merma = line.itemMP.merma;
                    let anioS1 = line.costosItemMP.semana1.anio;
                    let semanaS1 = line.costosItemMP.semana1.semana;
                    let costoMPS1 = line.costosItemMP.semana1.costoMP;
                    let costoEmpaqueS1 = line.costosItemMP.semana1.empaqueMP;
                    let anioS2 = line.costosItemMP.semana2.anio;
                    let semanaS2 = line.costosItemMP.semana2.semana;
                    let costoMPS2 = line.costosItemMP.semana2.costoMP;
                    let costoEmpaqueS2 = line.costosItemMP.semana2.empaqueMP;
                    let costoSAP = line.itemMP.costoSAP;
                    let queryInsertDetalleCalculoMP = `Insert into ${bdmysql}.detalle_calculo_mp (id_calculo,fatherItemCode,ItemCode,ItemName,empaque,cantidad,
                                                                                              anioS0,semanaS0,costoMPS0,costoEmpaqueS0,
                                                                                              anioS1,semanaS1,costoMPS1,costoEmpaqueS1,
                                                                                              anioS2,semanaS2,costoMPS2,costoEmpaqueS2,costoSAP,merma)
                                                                                      values (${id_calculo},'${fatherItemCode}','${ItemCode}','${ItemName}','${empaque}',${cantidad},
                                                                                             ${anioS0},${semanaS0},${costoMPS0},${costoEmpaqueS0},
                                                                                             ${anioS1},${semanaS1},${costoMPS1},${costoEmpaqueS1},
                                                                                             ${anioS2},${semanaS2},${costoMPS2},${costoEmpaqueS2},${costoSAP},${merma})`;
                    let resultInsertDetalleCalculoMP = yield connection.query(queryInsertDetalleCalculoMP);
                }
                for (let line of detalle_calculo_precio_item) {
                    let linea = line.linea;
                    let ItemCode = line.ItemCode;
                    let ItemName = line.ItemName;
                    let precioGerente = line.lpGerente;
                    let precioVendedor = line.lpVendedor;
                    let precioLP = line.lPrecio;
                    let promMercado = line.precioMercado;
                    let brutoS0 = line.brutoS0;
                    let netoS0 = line.totalS0;
                    let brutoS1 = line.brutoS1;
                    let netoS1 = line.totalS1;
                    let brutoS2 = line.brutoS2;
                    let netoS2 = line.totalS2;
                    let promVentaSap = line.precioVentaPT;
                    let costoVentaPTsemana0 = line.costoVentaPTsemana0;
                    let costoTotalPTsemana0 = line.costoTotalPTsemana0;
                    let recurso = line.recurso;
                    let costoRecurso = line.costoRecurso;
                    let brutoS0SAP = line.brutoS0SAP;
                    let totalS0SAP = line.totalS0SAP;
                    let costoVentaPTSAP = line.costoVentaPTSAP;
                    let costoTotalPTSAP = line.costoTotalPTSAP;
                    let otrosCostos = line.otrosCostos;
                    let queryInsertDetalleCalculoMP = `Insert into ${bdmysql}.detalle_precio_calculo_item (id_calculo,linea,ItemCode,ItemName,precioGerente,precioVendedor,
                                                                                                       precioLP,promMercado,brutoS0,netoS0,brutoS1,netoS1,brutoS2,netoS2, promVentaSap,
                                                                                                       costoVentaPTsemana0,costoTotalPTsemana0,recurso,costoRecurso,brutoS0SAP,totalS0SAP,costoVentaPTSAP,costoTotalPTSAP,otrosCostos)
                                                                                      values (${id_calculo},${linea},'${ItemCode}','${ItemName}',${precioGerente},${precioVendedor},
                                                                                              ${precioLP},${promMercado},${brutoS0},${netoS0},${brutoS1},${netoS1},${brutoS2},${netoS2},${promVentaSap},
                                                                                              ${costoVentaPTsemana0},${costoTotalPTsemana0}, '${recurso}',${costoRecurso},${brutoS0SAP},${totalS0SAP},
                                                                                              ${costoVentaPTSAP},${costoTotalPTSAP},'${JSON.stringify(otrosCostos)}')`;
                    let resultInsertDetalleCalculoMP = yield connection.query(queryInsertDetalleCalculoMP);
                }
                yield connection.commit();
                res.json({ error, message });
            }
            catch (error) {
                console.error('ERROR ------>', error);
                yield connection.rollback();
                return res.status(501).json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    anularCalculoPreciosItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const idCalculo = req.body;
                console.log(idCalculo);
                let queryAnularCalculo = `Update ${bdmysql}.calculo_precio_item SET estado ='INACTIVO' where id in (${idCalculo})`;
                console.log(queryAnularCalculo);
                const resultInsert = yield connection.query(queryAnularCalculo);
                console.log(resultInsert);
                let message = '';
                if (resultInsert.affectedRows > 0) {
                    message = `Se realizo correctamente la anulación de ${resultInsert.affectedRows > 1 ? 'los calculos seleccionados' : 'el calculo seleccionado'}`;
                }
                yield connection.commit();
                res.json({ message });
            }
            catch (error) {
                console.error('ERROR ------>', error);
                yield connection.rollback();
                return res.status(501).json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    getInfoCalculoItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { id } = req.query;
                //Seleccionar 
                let queryList = `SELECT * 
                                     FROM ${bdmysql}.calculo_precio_item 
                                     WHERE  id=${id}`;
                // console.log(queryList);
                let calculo_precio_item = yield database_1.db.query(queryList);
                let detalle_precio_calculo_item = yield database_1.db.query(`Select * from ${bdmysql}.detalle_precio_calculo_item where id_calculo = ${id}`);
                let detalle_calculo_mp = yield database_1.db.query(`Select * from ${bdmysql}.detalle_calculo_mp where id_calculo = ${id}`);
                let infoCalculoItem = {
                    calculo_precio_item,
                    detalle_precio_calculo_item,
                    detalle_calculo_mp
                };
                res.json(infoCalculoItem);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getPrecioVentaItemSAP(req, res) {
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
                const { item, fechaInicio, fechaFin } = req.query;
                console.log(req.query);
                const precioVentaItem = yield helpers_1.default.objectToArray(yield helpers_1.default.getPrecioVentaItemSAP(compania, item, fechaInicio, fechaFin));
                res.json(precioVentaItem);
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
