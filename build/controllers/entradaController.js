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
class EntradaController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = decodedToken.infoUsuario;
                const bdmysql = infoUsuario.bdmysql;
                const perfilesUsuario = decodedToken.perfilesUsuario;
                let where = "";
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.id_user=${infoUsuario.id} `;
                }
                //console.log(decodedToken);
                let queryList = `SELECT t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,
            t0.doctype,t0.status,t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,
            t0.reqdate,t0.comments,t0.trm,t0.codigoproveedor, t0.nombreproveedor,pedidonumsap,
           
            SUM(linetotal) AS "subtotal",SUM(taxvalor) AS "impuestos",SUM(linegtotal) AS "total"
            FROM ${bdmysql}.entrada t0
            INNER JOIN ${bdmysql}.entrada_det t1 ON t1.id_entrada = t0.id
            ${where}
            GROUP BY 
            t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t0.doctype,t0.status,
            t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,t0.reqdate,
            t0.comments,t0.trm,t0.codigoproveedor, t0.nombreproveedor,pedidonumsap
            ORDER BY t0.id DESC`;
                //console.log(queryList);
                const entrada = yield database_1.db.query(queryList);
                //console.log(solped);
                res.json(entrada);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            const newEntrada = req.body;
            console.log(newEntrada);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let querySolped = `Insert into ${bdmysql}.entrada set ?`;
                newEntrada.entrada.docdate = yield helpers_1.default.format(newEntrada.entrada.docdate);
                newEntrada.entrada.docduedate = yield helpers_1.default.format(newEntrada.entrada.docduedate);
                newEntrada.entrada.taxdate = yield helpers_1.default.format(newEntrada.entrada.taxdate);
                newEntrada.entrada.reqdate = yield helpers_1.default.format(newEntrada.entrada.reqdate);
                let resultInsertEntrada = yield connection.query(querySolped, [newEntrada.entrada]);
                //console.log(resultInsertSolped);
                let entradaId = resultInsertEntrada.insertId;
                let newEntradaDet = [];
                let newEntradaLine = [];
                for (let item in newEntrada.EntradaDet) {
                    newEntradaLine.push(entradaId);
                    newEntradaLine.push(newEntrada.EntradaDet[item].linenum);
                    newEntradaLine.push(newEntrada.EntradaDet[item].itemcode);
                    newEntradaLine.push(newEntrada.EntradaDet[item].dscription);
                    newEntradaLine.push(newEntrada.EntradaDet[item].acctcode);
                    newEntradaLine.push(newEntrada.EntradaDet[item].cantidad);
                    newEntradaLine.push(newEntrada.EntradaDet[item].precio);
                    newEntradaLine.push(newEntrada.EntradaDet[item].moneda);
                    newEntradaLine.push(newEntrada.EntradaDet[item].trm);
                    newEntradaLine.push(newEntrada.EntradaDet[item].linetotal);
                    newEntradaLine.push(newEntrada.EntradaDet[item].tax);
                    newEntradaLine.push(newEntrada.EntradaDet[item].taxvalor);
                    newEntradaLine.push(newEntrada.EntradaDet[item].linegtotal);
                    newEntradaLine.push(newEntrada.EntradaDet[item].ocrcode);
                    newEntradaLine.push(newEntrada.EntradaDet[item].ocrcode2);
                    newEntradaLine.push(newEntrada.EntradaDet[item].ocrcode3);
                    newEntradaLine.push(newEntrada.EntradaDet[item].whscode);
                    newEntradaLine.push(newEntrada.entrada.id_user);
                    newEntradaLine.push(newEntrada.EntradaDet[item].cantidad_pedido);
                    newEntradaLine.push(newEntrada.EntradaDet[item].cantidad_pendiente);
                    newEntradaLine.push(newEntrada.EntradaDet[item].BaseDocNum);
                    newEntradaLine.push(newEntrada.EntradaDet[item].BaseEntry);
                    newEntradaLine.push(newEntrada.EntradaDet[item].BaseLine);
                    newEntradaLine.push(newEntrada.EntradaDet[item].BaseType);
                    newEntradaDet.push(newEntradaLine);
                    newEntradaLine = [];
                }
                //console.log(newEntradaDet);
                let queryInsertDetSolped = `
                Insert into ${bdmysql}.entrada_det (id_entrada,linenum,itemcode,dscription,acctcode,
                                                    quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,
                                                    ocrcode2,ocrcode3,whscode,id_user,cantidad_pedido,
                                                    cantidad_pendiente,basedocnum,baseentry,baseline,basetype) values ?
            `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newEntradaDet]);
                console.log(resultInsertSolpedDet);
                if (resultInsertSolpedDet.affectedRows) {
                    //Registrar entrada en SAP
                    let dataForSAP = yield helpers_1.default.loadInfoEntradaToJSONSAP(newEntrada);
                    console.log(dataForSAP);
                    //registrar Entrada en SAP
                    const resultResgisterSAP = yield helpers_1.default.registerEntradaSAP(infoUsuario, dataForSAP);
                    if (resultResgisterSAP.error) {
                        console.log(resultResgisterSAP.error.message.value);
                        connection.rollback();
                        res.json({ status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId} ${resultResgisterSAP.error.message.value}` });
                    }
                    else {
                        console.log(resultResgisterSAP.DocNum);
                        //Actualizar  sapdocnum, entrada
                        let queryUpdateEntrada = `Update ${bdmysql}.entrada t0 Set t0.sapdocnum ='${resultResgisterSAP.DocNum}'  where t0.id = ?`;
                        let resultUpdateEntrada = yield connection.query(queryUpdateEntrada, [entradaId]);
                        console.log(resultUpdateEntrada);
                        connection.commit();
                        res.json({ status: 200, message: `Se realizo correctamente el registro de la entrada ${entradaId} generando el documento SAP numero ${resultResgisterSAP.DocNum}` });
                    }
                }
                else {
                    connection.rollback();
                    res.json({ status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId}` });
                }
            }
            catch (err) {
                // Print errors
                console.log(err);
                // Roll back the transaction
                connection.rollback();
                res.json({ err, status: 501 });
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    getEntradaById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            const { id } = req.params;
            console.log(infoUsuario, bdmysql, id);
            try {
                let entradaObject = yield helpers_1.default.getEntradaById(id, bdmysql);
                res.json(entradaObject);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const entradaController = new EntradaController();
exports.default = entradaController;
