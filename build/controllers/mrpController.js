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
                console.log(inventarioMP);
                let totalInvMP = 0;
                for (let item of inventarioMP) {
                    totalInvMP = totalInvMP + eval(item.OnHand);
                }
                //Inventario de Materia prima en producto terminado simple            
                let inventarioPT = array_inventarios.filter((infoItem) => infoItem.INVENTARIO === 'PT' && infoItem.ItemCode === item && infoItem.State === zona);
                console.log(inventarioPT);
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
                //Inventario de materia prima en transito abierta con fecha anterior a la fecha de inicio calculadora
                let inventarioItemTransitoPreFecha = array_inventarios.filter(data => data.TIPO === 'Compra' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.ETA) < new Date(fechainicio) &&
                    data.U_NF_STATUS != 'Descargado');
                //console.log('inventarioItemTransitoPreFecha',inventarioItemTransitoPreFecha);
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
                //Inventario de materia prima que esta en una solped
                let inventarioItenSolicitado = array_inventarios.filter(data => data.TIPO === 'Necesidad' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                //Inventario de materia prima  que esta en una solped abierta con fecha anterior a la fecha de inicio calculadora
                let inventarioItenSolicitadoPreFecha = array_inventarios.filter(data => data.TIPO === 'Necesidad' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) < new Date(fechainicio));
                //console.log('inventarioItenSolicitadoPreFecha',inventarioItenSolicitadoPreFecha);
                //Obtener compras proyectadas de materia prima en Mysql Portal
                let comprasProyectadas = yield helpers_1.default.getInventariosProyectados(infoUsuario[0]);
                let comprasProyectadasMP = comprasProyectadas.filter((data) => data.TIPO === 'Proyectado' &&
                    data.State_Code === zona &&
                    data.ItemCode === item &&
                    new Date(data.FECHANECESIDAD) >= new Date(fechainicio) &&
                    new Date(data.FECHANECESIDAD) <= new Date(fechafin));
                console.log('comprasProyectadasMP', comprasProyectadasMP);
                let consolidadoInventarios = {
                    inventarioItemTransito,
                    inventarioItemTransitoPreFecha,
                    totalInventarioItemZF,
                    inventarioItenSolicitado,
                    inventarioItenSolicitadoPreFecha,
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
                let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa Order by fechasemana ASC`;
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
                //console.log(req.body);
                let queryList = `SELECT * FROM  ${bdmysql}.maxminitems`;
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
                //console.log(infoFilePresupuesto);
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
                    //console.log(queryList);
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
                    //console.log(queryRegistro);
                    let resultRegistro = yield database_1.db.query(queryRegistro);
                    console.log(resultRegistro);
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
                console.log(anexo);
                console.log(fs_1.default.existsSync(anexo.ruta));
                let msgResult;
                if (fs_1.default.existsSync(anexo.ruta)) {
                    let results = [];
                    fs_1.default.createReadStream(anexo.ruta)
                        .pipe((0, csv_parser_1.default)({ separator: infoFilePresupuesto.separador }))
                        .on('data', (data) => results.push(data))
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        //console.log(results);
                        // [
                        //   { NAME: 'Daffy Duck', AGE: '24' },
                        //   { NAME: 'Bugs Bunny', AGE: '22' }
                        // ]
                        let queryList = "";
                        let queryRegistro = "";
                        let lineasActualizadas = 0;
                        let lineasRegistradas = 0;
                        for (let linea of results) {
                            console.log(new Date(linea.FECHASEMANA));
                            let fechasemana = new Date(linea.FECHASEMANA);
                            queryList = `SELECT * 
                                    FROM ${bdmysql}.presupuestoventa 
                                    WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                        semana =${linea.SEMANA} AND 
                                        itemcode = '${linea.ITEM}' AND 
                                        codigozona = '${linea.CODIGOZONA}'`;
                            //console.log(queryList);
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
                            //console.log(queryRegistro);
                            let resultRegistro = yield database_1.db.query(queryRegistro);
                            //console.log(resultRegistro);
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
                //console.log(infoFilePresupuesto);
                let queryList = "";
                let queryRegistro = "";
                let lineasActualizadas = 0;
                let lineasRegistradas = 0;
                for (let linea of infoFileaxMin) {
                    console.log(new Date(linea.fechasemana));
                    let fechasemana = new Date(linea.fechasemana);
                    queryList = `SELECT * 
                             FROM ${bdmysql}.maxminitems 
                             WHERE itemcode = '${linea.itemcode}' AND 
                                   zona = '${linea.codigozona}'`;
                    //console.log(queryList);
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
                    //console.log(queryRegistro);
                    let resultRegistro = yield database_1.db.query(queryRegistro);
                    console.log(resultRegistro);
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
