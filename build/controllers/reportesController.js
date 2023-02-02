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
class ReportesController {
    evaluacionProveedores(req, res) {
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
                let where = "";
                let parametros = req.body;
                const { fechainicio, fechafin, proveedor, tipo } = parametros;
                console.log(fechainicio, fechafin, proveedor, tipo);
                if (proveedor != '') {
                    where += ` AND t0.codigoproveedor = '${proveedor}' `;
                }
                //console.log(decodedToken);
                let query = `SELECT t0.codigoproveedor AS 
                                CardCode,t0.nombreproveedor AS CardName, 
                                COUNT(DISTINCT t0.sapdocnum) AS entradas,
                                COUNT(DISTINCT t0.pedidonumsap) AS pedidos,
                                AVG(IFNULL(U_NF_PUNTAJE_HE,0)) AS puntaje,
                                CASE WHEN (AVG(IFNULL(U_NF_PUNTAJE_HE,0)))>=90 THEN "Exelente"
                                    WHEN (AVG(IFNULL(U_NF_PUNTAJE_HE,0)))>=60 THEN "Bueno"
                                    ELSE "Regular" END AS Calificacion
                                    

                                FROM ${bdmysql}.entrada t0
                                WHERE t0.docdate BETWEEN '${fechainicio}' AND '${fechafin}'
                                ${where} 
                                GROUP BY codigoproveedor,nombreproveedor`;
                //console.log(queryList);
                const resultQuery = yield database_1.db.query(query);
                console.log(resultQuery);
                res.json(resultQuery);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    detalleEntradasProveedor(req, res) {
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
                let where = "";
                let parametros = req.body;
                const { fechainicio, fechafin, proveedor, tipo } = parametros;
                //console.log(fechainicio, fechafin, proveedor, tipo);
                if (proveedor != '') {
                    where += ` AND t0.codigoproveedor = '${proveedor}' `;
                }
                //console.log(decodedToken);
                let query = `SELECT t0.pedidonumsap AS pedido,
                        t0.sapdocnum AS DocNum,
                        t0.U_NF_TIPO_HE AS Tipo,
                        t0.U_NF_BIEN_OPORTUNIDAD AS Oportunidad,
                        t0.U_NF_SERVICIO_CALIDAD AS Calidad,
                        t0.U_NF_SERVICIO_TIEMPO AS Tiempo,
                        t0.U_NF_SERVICIO_SEGURIDAD AS Seguridad,
                        t0.U_NF_SERVICIO_AMBIENTE AS Ambiente,
                        t0.U_NF_PUNTAJE_HE AS Puntaje,
                        t0.U_NF_CALIFICACION AS Calificacion
            
                                FROM ${bdmysql}.entrada t0
                                WHERE t0.docdate BETWEEN '${fechainicio}' AND '${fechafin}'
                                ${where}`;
                console.log(query);
                const resultQuery = yield database_1.db.query(query);
                console.log(resultQuery);
                res.json(resultQuery);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const reportesController = new ReportesController();
exports.default = reportesController;
