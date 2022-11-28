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
                    //console.log(item);
                    if (zonas.filter(item2 => item2.State == item.State).length === 0) {
                        linea = { State: item.State, 'PENTRADA': item.PENTRADA };
                        zonas.push(linea);
                    }
                }
                //console.log(inventarios,zonas);
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
                console.log(req.body);
                //Obtener inventarios de SAP  de Materia prima a granel y en producto terminado Simple
                let inventarios = yield helpers_1.default.getInventariosMPXE(infoUsuario[0]);
                let array_inventarios = [];
                for (let item in inventarios) {
                    array_inventarios.push(inventarios[item]);
                }
                //Inventario de Materia prima  a granel
                let inventarioMP = array_inventarios.filter((infoItem) => infoItem.INVENTARIO === 'MP' && infoItem.ItemCode === item && infoItem.State === zona);
                let totalInvMP = 0;
                for (let item of inventarioMP) {
                    totalInvMP = totalInvMP + eval(item.OnHand);
                }
                //Inventario de Materia prima en producto terminado simple            
                let inventarioPT = array_inventarios.filter((infoItem) => infoItem.INVENTARIO === 'PT' && infoItem.ItemCode === item && infoItem.State === zona);
                let totalInvPT = 0;
                for (let item of inventarioPT) {
                    totalInvPT = totalInvPT + eval(item.OnHand);
                }
                let totalInventario = {
                    inventarioMP: totalInvMP,
                    inventarioPT: totalInvPT
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
                //Obtener invetarios de Materia prima en transito que esten en una solped/OC en SAP
                let inventarios = yield helpers_1.default.getInventariosTrackingMPXE(infoUsuario[0]);
                let array_inventarios = [];
                for (let item in inventarios) {
                    array_inventarios.push(inventarios[item]);
                }
                let { item, zona, fechainicio, fechafin } = req.body;
                console.log(req.body);
                //Inventario de materia prima en transito que esta en una orden de compra que su estatus es diferente a descargado
                let inventarioItemTransito = array_inventarios.filter(data => data.TIPO === 'Compra' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.ETA) >= new Date(fechainicio) &&
                    new Date(data.ETA) <= new Date(fechafin) &&
                    data.U_NF_STATUS != 'Descargado');
                console.log(inventarioItemTransito);
                //Inventario de materia prima en transito que esta en una OC que su estatus es descargado en ZF
                let inventarioItemZF = array_inventarios.filter(data => data.TIPO === 'Compra' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    //new Date(data.ETA) >= new Date(fechainicio) && 
                    //new Date(data.ETA) <= new Date(fechafin) &&
                    data.U_NF_STATUS == 'Descargado');
                let totalInventarioItemZF = 0;
                if (inventarioItemZF.length > 0) {
                    for (let item of inventarioItemZF) {
                        totalInventarioItemZF = totalInventarioItemZF + eval(item.OpenCreQty);
                    }
                }
                //Inventario de materia prima en transito que esta en una solped
                let inventarioItenSolicitado = array_inventarios.filter(data => data.TIPO === 'Necesidad' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                //Obtener compras proyectadas de materia prima en Mysql Portal
                let comprasProyectadas = yield helpers_1.default.getInventariosProyectados(infoUsuario[0]);
                let comprasProyectadasMP = comprasProyectadas.filter((data) => data.TIPO === 'Proyectado' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                console.log(comprasProyectadasMP);
                let consolidadoInventarios = {
                    inventarioItemTransito,
                    totalInventarioItemZF,
                    inventarioItenSolicitado,
                    inventarioItemZF,
                    comprasProyectadasMP
                };
                //console.log(consolidadoInventarios);
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
                let { item, zona, fechainicio, fechafin } = req.body;
                let fechaI = new Date(fechainicio);
                let fechaF = new Date(fechafin);
                //console.log(fechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate());
                //console.log(fechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate());
                let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa 
                                      WHERE  itemcode = '${item}' AND 
                                             codigozona = '${zona}' AND 
                                             fechasemana BETWEEN '${fechaI.getFullYear() + "-" + (fechaI.getMonth() + 1) + "-" + fechaI.getDate()}' AND 
                                                                 '${fechaF.getFullYear() + "-" + (fechaF.getMonth() + 1) + "-" + fechaF.getDate()}'`;
                let presupuesto = yield database_1.db.query(queryList);
                //console.log('Presupuesto',queryList,presupuesto);
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
                console.log(req.body);
                let queryList = `SELECT * FROM  ${bdmysql}.maxminitems WHERE itemcode = '${item}' AND zona = '${zona}'`;
                console.log(queryList);
                let maxminresult = yield database_1.db.query(queryList);
                //console.log(inventarios);
                res.json(maxminresult);
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
