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
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SolpedController {
    list(req, res) {
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
                //////console.log(await helper.loginWsSAP(infoUsuario[0]));
                let serie = yield helpers_1.default.getCodigoSerie(infoUsuario[0].dbcompanysap, '1470000113', 'SPMP');
                let where = "";
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.id_user=${infoUsuario[0].id} and t0.serie!='${serie}'`;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                    where = ` WHERE t0.serie!='${serie}'`;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
                    where = ` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and t0.serie!='${serie}'`;
                }
                //////console.log(decodedToken);
                let queryList = `SELECT t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,
            t0.doctype,t0.status,t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,
            t0.reqdate,t0.u_nf_depen_solped,t0.approved,t0.comments,t0.trm,
            (CASE
                WHEN t0.approved = 'P' THEN (SELECT t2.nombreaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='P' ORDER BY t2.nivel ASC LIMIT 1)
                WHEN t0.approved = 'R' THEN (SELECT t2.nombreaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='R' ORDER BY t2.nivel ASC LIMIT 1)
                ELSE ""
            END) aprobador,
            (CASE
                WHEN t0.approved = 'P' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='P' ORDER BY t2.nivel ASC LIMIT 1)
                WHEN t0.approved = 'R' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='R' ORDER BY t2.nivel ASC LIMIT 1)
                ELSE ""
            END) usersapaprobador,
            SUM(linetotal) AS "subtotal",SUM(taxvalor) AS "impuestos",SUM(linegtotal) AS "total"
            FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
            GROUP BY 
            t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t0.doctype,t0.status,
            t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,t0.reqdate,t0.u_nf_depen_solped,
            t0.approved,t0.comments,t0.trm
            ORDER BY t0.id DESC`;
                //////console.log(queryList);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);
                const solped = yield database_1.db.query(queryList);
                //////console.log(solped);
                res.json(solped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listAprobadores(req, res) {
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
                //////console.log(await helper.loginWsSAP(infoUsuario[0]));
                let serie = yield helpers_1.default.getCodigoSerie(infoUsuario[0].dbcompanysap, '1470000113', 'SPMP');
                let where = "";
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.id_user=${infoUsuario[0].id} and t0.serie!='${serie}' and t0.approved = 'A' and t0.sapdocnum != 0`;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                    where = ` WHERE t0.serie!='${serie}' and t0.approved = 'A' and t0.sapdocnum != 0`;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
                    where = ` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and t0.serie!='${serie}' and t0.approved = 'A' and t0.sapdocnum != 0`;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil == 'Comprador').length > 0) {
                    where = ` WHERE t0.serie!='${serie}' and t0.approved = 'A' and t0.sapdocnum != 0`;
                }
                //////console.log(decodedToken);
                let queryList = `SELECT t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,
            t0.doctype,t0.status,t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,
            t0.reqdate,t0.u_nf_depen_solped,t0.approved,t0.comments,t0.trm,
            (CASE
                WHEN t0.approved = 'P' THEN (SELECT t2.nombreaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='P' ORDER BY t2.nivel ASC LIMIT 1)
                WHEN t0.approved = 'R' THEN (SELECT t2.nombreaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='R' ORDER BY t2.nivel ASC LIMIT 1)
                ELSE ""
            END) aprobador,
            (CASE
                WHEN t0.approved = 'P' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='P' ORDER BY t2.nivel ASC LIMIT 1)
                WHEN t0.approved = 'R' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='R' ORDER BY t2.nivel ASC LIMIT 1)
                ELSE ""
            END) usersapaprobador,
            SUM(linetotal) AS "subtotal",SUM(taxvalor) AS "impuestos",SUM(linegtotal) AS "total"
            FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
            GROUP BY 
            t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t0.doctype,t0.status,
            t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,t0.reqdate,t0.u_nf_depen_solped,
            t0.approved,t0.comments,t0.trm
            ORDER BY t0.id DESC`;
                //////console.log(queryList);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);
                const solped = yield database_1.db.query(queryList);
                //////console.log(solped);
                res.json(solped);
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
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const newSolped = req.body;
            //////console.log(newSolped.solped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let querySolped = `Insert into ${bdmysql}.solped set ?`;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                let resultInsertSolped = yield connection.query(querySolped, [newSolped.solped]);
                //////console.log(resultInsertSolped);
                let solpedId = resultInsertSolped.insertId;
                let newSolpedDet = [];
                let newSolpedLine = [];
                for (let item in newSolped.solpedDet) {
                    newSolpedLine.push(solpedId);
                    newSolpedLine.push(newSolped.solpedDet[item].linenum);
                    newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                    newSolpedLine.push(newSolped.solpedDet[item].dscription);
                    newSolpedLine.push(yield helpers_1.default.format(newSolped.solpedDet[item].reqdatedet));
                    newSolpedLine.push(newSolped.solpedDet[item].linevendor);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcode);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcodename);
                    newSolpedLine.push(newSolped.solpedDet[item].quantity);
                    newSolpedLine.push(newSolped.solpedDet[item].price);
                    newSolpedLine.push(newSolped.solpedDet[item].moneda);
                    newSolpedLine.push(newSolped.solpedDet[item].trm);
                    newSolpedLine.push(newSolped.solpedDet[item].linetotal);
                    newSolpedLine.push(newSolped.solpedDet[item].tax);
                    newSolpedLine.push(newSolped.solpedDet[item].taxvalor);
                    newSolpedLine.push(newSolped.solpedDet[item].linegtotal);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                    newSolpedLine.push(newSolped.solpedDet[item].whscode);
                    newSolpedLine.push(newSolped.solpedDet[item].id_user);
                    newSolpedDet.push(newSolpedLine);
                    newSolpedLine = [];
                }
                //////console.log(newSolpedDet);
                let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //////console.log(resultInsertSolpedDet);
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente el registro de la solped ${solpedId}`);
                res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`, solpednum: solpedId });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    getSolpedById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { id } = req.params;
                let solpedObject = yield helpers_1.default.getSolpedById(id, bdmysql);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} consulto la información de la solped ${id}`);
                res.json(solpedObject);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getAnexoSolpedById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { id, id2 } = req.params;
                let solpedObject = yield helpers_1.default.getSolpedById(id, bdmysql);
                let anexos = solpedObject.anexos;
                let anexo = anexos.filter((item) => item.id == id2);
                let anexoBase64 = "";
                if (anexo[0].archivo != null) {
                    //anexoBase64 = anexo[0].archivo.toString('base64');
                    anexoBase64 = anexo[0].archivo; // .toString();
                    var pattern = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
                    //If the inputString is NOT a match
                    if (!pattern.test(anexo[0].archivo)) {
                        ////console.log("no base64 found");
                        anexoBase64 = anexo[0].archivo.toString('base64');
                    }
                    else {
                        ////console.log("base64 found");
                        anexoBase64 = anexo[0].archivo.toString();
                    }
                }
                //////console.log(anexoBase64);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} consulto la información del anexo ${id2} de la solped ${id}`);
                res.json({ data: anexoBase64 });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const newSolped = req.body;
            ////console.log(newSolped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let solpedId = newSolped.solped.id;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                //Actualizar encabezado solped 
                let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
                let resultUpdateSolped = yield connection.query(querySolped, [newSolped.solped, solpedId]);
                //////console.log(resultUpdateSolped);
                //Borrar detalle Solped seleccionada
                querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
                let resultDeleteSolpedDet = yield connection.query(querySolped, [solpedId]);
                //////console.log(resultDeleteSolpedDet);
                let newSolpedDet = [];
                let newSolpedLine = [];
                for (let item in newSolped.solpedDet) {
                    newSolpedLine.push(solpedId);
                    newSolpedLine.push(newSolped.solpedDet[item].linenum);
                    newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                    newSolpedLine.push(newSolped.solpedDet[item].dscription);
                    newSolpedLine.push(yield helpers_1.default.format(newSolped.solpedDet[item].reqdatedet));
                    newSolpedLine.push(newSolped.solpedDet[item].linevendor);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcode);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcodename);
                    newSolpedLine.push(newSolped.solpedDet[item].quantity);
                    newSolpedLine.push(newSolped.solpedDet[item].price);
                    newSolpedLine.push(newSolped.solpedDet[item].moneda);
                    newSolpedLine.push(newSolped.solpedDet[item].trm);
                    newSolpedLine.push(newSolped.solpedDet[item].linetotal);
                    newSolpedLine.push(newSolped.solpedDet[item].tax);
                    newSolpedLine.push(newSolped.solpedDet[item].taxvalor);
                    newSolpedLine.push(newSolped.solpedDet[item].linegtotal);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                    newSolpedLine.push(newSolped.solpedDet[item].whscode);
                    newSolpedLine.push(newSolped.solpedDet[item].id_user);
                    newSolpedDet.push(newSolpedLine);
                    newSolpedLine = [];
                }
                ////console.log(newSolpedDet);
                let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //////console.log(resultInsertSolpedDet);
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped ${solpedId}`);
                res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    cancelacionSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            //Obtener array de id de solped seleccionadas
            const arraySolpedId = req.body;
            ////console.log(arraySolpedId);
            let connection = yield database_1.db.getConnection();
            let errorSAP = "";
            yield connection.beginTransaction();
            try {
                for (let id of arraySolpedId) {
                    let infoSolped = yield helpers_1.default.getSolpedById(id, bdmysql);
                    if (infoSolped.solped.approved == 'A') {
                        //Anular solped en SAP
                        let infoSolpedSAP = yield helpers_1.default.getSolpedByIdSL(infoUsuario[0], infoSolped.solped.sapdocnum, infoSolped.solped.serie);
                        if (infoSolpedSAP.value && infoSolpedSAP.value.length > 0) {
                            let DocEntry = infoSolpedSAP.value[0].DocEntry;
                            ////console.log(DocEntry);
                            let resultAnulacion = yield helpers_1.default.anularSolpedByIdSL(infoUsuario[0], DocEntry);
                            //////console.log(resultAnulacion);
                            if (resultAnulacion.error) {
                                ////console.log(resultAnulacion.error.message.value);
                                errorSAP = resultAnulacion.error.message.value;
                            }
                        }
                    }
                    let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'C', t0.status='C' where t0.id in (?)`;
                    const result = yield connection.query(queryUpdateSolped, [id]);
                }
                if (errorSAP == "") {
                    connection.commit();
                    yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo la cancelación de las siguientes solicitudes ${arraySolpedId}`);
                    res.json({ status: "ok", message: `Las solicitudes ${arraySolpedId} seeccionadas fueron canceladas.` });
                }
                else {
                    connection.rollback();
                    yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo la cancelación de las siguientes solicitudes ${arraySolpedId} pero ocurrio el siguiente error: ${errorSAP}`);
                    res.json({ status: "error", message: `Ocurrio un error al cancelar la solped en SAP. error: ${errorSAP}` });
                }
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                connection.rollback();
                res.json({ status: "error", message: err });
            }
        });
    }
    envioAprobacionSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            let urlbk = req.protocol + '://' + req.get('host');
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const origin = req.headers.origin;
            const bdPresupuesto = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'COPIA_PRESUPUESTO' : 'PRESUPUESTO';
            //Obtener array de id de solped seleccionadas
            const arraySolpedId = req.body;
            ////console.log(urlbk,urlbk.includes('localhost'),urlbk.includes('-dev.') );
            //Obtener aray de modelos de autorización para la aprobacion de la solped SAP
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
            //////console.log(url2);
            let connection = yield database_1.db.getConnection();
            yield connection.beginTransaction();
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
                //////console.log(response2.body); 
                const data2 = yield response2.json();
                //////console.log(data2);
                //Covertir en array el objeto obtenido desde el ws Xengine de SAP y parsear el area y la condición del query de SAP
                let arrayModelos = [];
                for (let item in data2) {
                    let pos_eq = data2[item].query.indexOf('=');
                    let pos_quote = data2[item].query.indexOf(`'`, pos_eq);
                    let pos_next_quote = data2[item].query.indexOf(`'`, pos_quote + 1);
                    let area = data2[item].query.substring(pos_quote + 1, pos_next_quote);
                    let numeric = data2[item].query.indexOf(`(19,6)`) + '(19,6)'.length + 1;
                    let condicion = data2[item].query.substring(numeric, data2[item].query.length);
                    data2[item].area = area;
                    data2[item].condicion = condicion;
                    arrayModelos.push(data2[item]);
                }
                //////console.log(arrayModelos);
                //Recorrer el array de ids de solpeds seleccionadas para aprobación e identificar dentro del array de modelos  los posibles modelos que se pueden aplicar a cada solped
                let Solped;
                let modelos = [];
                let modeloid = 0;
                let modelosAprobacion;
                let arrayResult = [];
                let errorInsertAprobacion = false;
                let arrayErrorPresupuesto = [];
                let docEntrySolpedPresupuesto = 0;
                for (let id of arraySolpedId) {
                    //Obtener la info de la solped segun el id
                    Solped = yield helpers_1.default.getSolpedById(id, bdmysql);
                    //filtrar los modelos segun el usuario autor y area de la solped
                    modelos = arrayModelos.filter(modelo => modelo.autorusercode === Solped.solped.usersap && modelo.area === Solped.solped.u_nf_depen_solped);
                    //////console.log(modelos);
                    //Recorrer los modelos filtrados para evaluar las condiciones en la solped
                    try {
                        // Validar presupuesto de la solped 
                        let presupuesto = yield helpers_1.default.getPresupuesto(infoUsuario[0], id, bdmysql);
                        if (presupuesto.length > 0) {
                            connection.rollback();
                            let message = "";
                            if (presupuesto.length > 1) {
                                message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                            }
                            else {
                                message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                            }
                            return res.json([{ status: "error", message }]);
                        }
                        //Obtener datos de la solped y transformar a JSON SAP
                        let infoSolpedToSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
                        //console.log(infoSolpedToSAP);
                        //Cambiar el usuario Rquester por USERAPLICACIONES
                        infoSolpedToSAP.Requester = 'USERAPLICACIONES';
                        //cambiar la serie de la solped por la serie de la solped de la base de datos SAP de presupuesto tests: COPIA_PRESUPUESTO productivo: PRESUPUESTO
                        let seriesSolpedPresupuesto = yield helpers_1.default.getSeriesXE(bdPresupuesto, '1470000113');
                        let serieSolpedPresupuesto = 0;
                        for (let item in seriesSolpedPresupuesto) {
                            if (seriesSolpedPresupuesto[item].name == 'SP') {
                                serieSolpedPresupuesto = seriesSolpedPresupuesto[item].code;
                            }
                        }
                        infoSolpedToSAP.Series = serieSolpedPresupuesto;
                        infoSolpedToSAP.BPL_IDAssignedToInvoice = 2;
                        //Cambiar los items por las cuentas contables y quitar los impuestos , cambiar la cantidad a 1 y el total de la linea colocar en precio unitario
                        for (let line in infoSolpedToSAP.DocumentLines) {
                            infoSolpedToSAP.DocumentLines[line].ItemCode = infoSolpedToSAP.DocumentLines[line].AccountCode;
                            infoSolpedToSAP.DocumentLines[line].TaxCode = '';
                            infoSolpedToSAP.DocumentLines[line].Price = infoSolpedToSAP.DocType == 'S' ? infoSolpedToSAP.DocumentLines[line].LineTotal : ((infoSolpedToSAP.DocumentLines[line].Price || 0) * (infoSolpedToSAP.DocumentLines[line].Quantity || 1));
                            infoSolpedToSAP.DocumentLines[line].Quantity = 1;
                            infoSolpedToSAP.DocumentLines[line].WarehouseCode = 'NITROFER';
                        }
                        //console.log(infoSolpedToSAP);
                        //TODO: Registrar solped en SAP base de datos de presupuesto.
                        let infoUsuarioPresupuesto = [{ dbcompanysap: bdPresupuesto }];
                        const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuarioPresupuesto[0], infoSolpedToSAP);
                        if (resultResgisterSAP.error) {
                            connection.rollback();
                            return res.json([{ status: "error", message: 'Error al registrar solped en presupuesto: ' + resultResgisterSAP.error.message.value }]);
                        }
                        else {
                            //console.log(resultResgisterSAP);
                            //TODO: Obtener docentry o docnum para actualizar solped
                            docEntrySolpedPresupuesto = resultResgisterSAP.DocEntry;
                            let queryUpdateSopledPortal = `UPDATE ${bdmysql}.solped SET docentrySP = ${docEntrySolpedPresupuesto} WHERE id = ${id} `;
                            let resultUpdateSolpedPortal = yield connection.query(queryUpdateSopledPortal);
                        }
                        //let newAprobacion:any[] = [];
                        let newAprobacionLine = [];
                        for (let modelo of modelos) {
                            //Query que valida si la solped cumple con la condicion dada
                            let queryModelo = `SELECT (SUM(t1.linetotal)/t0.trm) AS total
                                        FROM ${bdmysql}.solped t0 
                                        INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id 
                                        WHERE t0.id = ${id}
                                        HAVING total ${modelo.condicion}`;
                            //////console.log(queryModelo);
                            const result = yield database_1.db.query(queryModelo);
                            //////console.log(result.length);
                            //Si el resultado de la consulta es mayo a cero se toma el id del modelo valido
                            if (result.length > 0) {
                                modeloid = modelo.modeloid;
                                //////console.log(modeloid);
                                newAprobacionLine.push(id);
                                newAprobacionLine.push(Solped.solped.id_user);
                                newAprobacionLine.push(modelo.autorusercode);
                                newAprobacionLine.push(modelo.emailautor);
                                newAprobacionLine.push(modelo.autornombre);
                                newAprobacionLine.push(modelo.area);
                                newAprobacionLine.push(modelo.condicion);
                                newAprobacionLine.push(modelo.aprobadorusercode);
                                newAprobacionLine.push(modelo.emailaprobador);
                                newAprobacionLine.push(modelo.aprobadornombre);
                                newAprobacionLine.push(modelo.nivel);
                                //////console.log(newAprobacionLine);
                                let existeNivel = `Select COUNT(*) AS filas from ${bdmysql}.aprobacionsolped where id_solped = ${id} and nivel = ${modelo.nivel} and estadoap='P' and estadoseccion='A'`;
                                let resultExisteNivel = yield database_1.db.query(existeNivel);
                                console.log(resultExisteNivel);
                                if (resultExisteNivel[0].filas == 0) {
                                    let queryInsertnewAprobacion = `
                                Insert into ${bdmysql}.aprobacionsolped (id_solped,
                                                                        iduserautor,
                                                                        usersapautor, 
                                                                        emailautor,
                                                                        nombreautor,
                                                                        area,
                                                                        condicion,
                                                                        usersapaprobador,
                                                                        emailaprobador,
                                                                        nombreaprobador,
                                                                        nivel) values (?)`;
                                    const resultInsertnewAprobacion = yield connection.query(queryInsertnewAprobacion, [newAprobacionLine]);
                                    //////console.log(resultInsertnewAprobacion);
                                    if (resultInsertnewAprobacion.affectedRows > 0) {
                                        arrayResult.push({ solpedid: id, status: "success" });
                                        newAprobacionLine = [];
                                        //Actualizar el estado de la solped a Pendiente
                                        let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'P' where t0.id in (?)`;
                                        const result = yield connection.query(queryUpdateSolped, [id]);
                                    }
                                    else {
                                        arrayResult.push({ solpedid: id, status: "error" });
                                        errorInsertAprobacion = true;
                                    }
                                }
                                //res.json({message:`Se realizo correctamnente el registro de la solped`});
                            }
                        }
                        connection.commit();
                    }
                    catch (err) {
                        // Print errors
                        ////console.log(err);
                        // Roll back the transaction
                        connection.rollback();
                        return res.json([{ status: "error", message: err }]);
                    }
                }
                if (!errorInsertAprobacion) {
                    //notificacion de envio aprobación solped x cada solped seleccionada
                    let solpedNotificacion;
                    for (let idSolped of arraySolpedId) {
                        //obtener remitente y siguiente destinarario de aprobación solped
                        solpedNotificacion = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                        let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, infoUsuario[0].logoempresa, origin, urlbk);
                        if (LineAprovedSolped != '') {
                            let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '24h');
                            //////console.log(aprobadorCrypt);
                            let html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, infoUsuario[0].logoempresa, solpedNotificacion, aprobadorCrypt, urlbk, false, true);
                            //////console.log(html);
                            //Obtener datos de la solped a aprobar
                            let infoEmail = {
                                //to: LineAprovedSolped.aprobador.email,
                                to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.aprobador.email,
                                //cc:LineAprovedSolped.autor.email,
                                subject: `Solicitud de aprobación Solped ${idSolped}`,
                                html
                            };
                            yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} solicito la aprobación de la solped  ${idSolped}`);
                            yield helpers_1.default.sendNotification(infoEmail);
                            html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, infoUsuario[0].logoempresa, solpedNotificacion, aprobadorCrypt, urlbk, false, false);
                            infoEmail.html = html;
                            infoEmail.to = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email; //enviar copia al autor de la solped
                            yield helpers_1.default.sendNotification(infoEmail);
                        }
                        else {
                            ////console.log(`No existe modelo de aprobación para la solped ${idSolped} `);
                            return res.json([{ status: "error", message: `No existe modelo de aprobación para la solped ${idSolped} ` }]);
                        }
                    }
                }
                //////console.log((solpedObject));
                return res.json(arrayResult);
            }
            catch (error) {
                console.error(error);
                connection.rollback();
                return res.json(error);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    aproved_portal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const logo = infoUsuario[0].logoempresa;
            const arraySolpedId = req.body;
            let urlbk = req.protocol + '://' + req.get('host');
            const bdPresupuesto = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'COPIA_PRESUPUESTO' : 'PRESUPUESTO';
            //////console.log(arraySolpedId);
            let connection = yield database_1.db.getConnection();
            let Solped;
            let messageSolped = "";
            let error = false;
            let arrayErrors = [];
            let arrayAproved = [];
            try {
                yield connection.beginTransaction();
                //Recorrer array de id de solped a aprobar
                for (let idSolped of arraySolpedId) {
                    // Validar presupuesto de la solped 
                    let presupuesto = yield helpers_1.default.getPresupuesto(infoUsuario[0], idSolped, bdmysql);
                    if (presupuesto.length > 0) {
                        connection.rollback();
                        let message = "";
                        if (presupuesto.length > 1) {
                            message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                        }
                        else {
                            message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                        }
                        //console.log(message);
                        return res.json([{ status: "error", message }]);
                    }
                    //Obtener la informacipn de la solped ppor id
                    Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                    //Consulta de liena de aprobación del usaurio aprobador
                    let queryLineaAprobacion = `Select * 
                                            from ${bdmysql}.aprobacionsolped t0 
                                            where t0.id_solped = ${idSolped} and 
                                                  t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                  t0.estadoseccion='A'`;
                    //////console.log(queryLineaAprobacion);
                    let resultLineaAprobacion = yield connection.query(queryLineaAprobacion);
                    // ////console.log(resultLineaAprobacion);
                    //Validar el estado de la linea de aprobación
                    if (resultLineaAprobacion[0].estadoap === 'P') {
                        //realiza el proceso de actualización de la linea de aprobacion  
                        let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                        let resultUpdateLineAproved = yield connection.query(queryUpdateLineAproved, [resultLineaAprobacion[0].id]);
                        //////console.log(resultUpdateLineAproved);
                        //Obtener información del proximo aprobador
                        let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, logo, req.headers.origin, urlbk, resultLineaAprobacion[0].id);
                        //////console.log(LineAprovedSolped);
                        if (LineAprovedSolped != '') {
                            let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '24h');
                            ////console.log(aprobadorCrypt);
                            let html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, true);
                            //Obtener datos de la solped a aprobar para notificación
                            let infoEmail = {
                                //to: LineAprovedSolped.aprobador.email,
                                to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.aprobador.email,
                                //cc:LineAprovedSolped.autor.email,
                                subject: `Solicitud de aprobación Solped ${idSolped}`,
                                html
                            };
                            //Envio de notificación al siguiente aprobador con copia al autor
                            yield helpers_1.default.sendNotification(infoEmail);
                            html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, false);
                            infoEmail.html = html;
                            infoEmail.to = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email;
                            yield helpers_1.default.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                            ////console.log(messageSolped);
                            arrayAproved.push({ idSolped, messageSolped, infoEmail });
                        }
                        else {
                            LineAprovedSolped = {
                                autor: {
                                    fullname: resultLineaAprobacion[0].nombreautor,
                                    email: resultLineaAprobacion[0].emailautor,
                                },
                                aprobador: {
                                    fullname: resultLineaAprobacion[0].nombreaprobador,
                                    email: resultLineaAprobacion[0].emailaprobador,
                                    usersap: resultLineaAprobacion[0].usersapaprobador,
                                },
                                infoSolped: {
                                    id_solped: idSolped,
                                    idlineap: resultLineaAprobacion[0].id,
                                    bdmysql,
                                    companysap: compania,
                                    logo,
                                    origin: req.headers.origin
                                }
                            };
                            //////console.log(LineAprovedSolped);
                            //Generar data para registro de la solped en SAP
                            let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
                            //registrar Solped en SAP
                            const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario[0], dataForSAP);
                            //////console.log(resultResgisterSAP);
                            if (resultResgisterSAP.error) {
                                error = true;
                                ////console.log(resultResgisterSAP.error.message.value);
                                arrayErrors.push({ idSolped, messageSolped: resultResgisterSAP.error.message.value });
                            }
                            else {
                                ////console.log(resultResgisterSAP.DocNum);
                                LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                                ////console.log(LineAprovedSolped);
                                //Actualizar solpedSAP
                                let docEntry = resultResgisterSAP.DocEntry;
                                let dataUpdateSolpedSAP = {
                                    U_AUTOR_PORTAL: Solped.solped.usersap,
                                    DocumentLines: [
                                        {
                                            U_ID_PORTAL: idSolped,
                                            U_NF_NOM_AUT_PORTAL: Solped.solped.usersap
                                        }
                                    ]
                                };
                                ////console.log(dataUpdateSolpedSAP);
                                ////console.log(JSON.stringify(dataUpdateSolpedSAP));
                                //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);
                                //Actualizar  sapdocnum, estado de aprobacion y de solped
                                let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                                let resultUpdateSolpedAproved = yield connection.query(queryUpdateSolpedAproved, [idSolped]);
                                //Registrar proceso de aprobacion solped en SAP
                                let resultResgisterProcApSA = yield helpers_1.default.registerProcApSolpedSAP(infoUsuario[0], bdmysql, idSolped, resultResgisterSAP.DocNum);
                                const html = yield helpers_1.default.loadBodyMailApprovedSolped(infoUsuario[0], LineAprovedSolped, logo, Solped, '', urlbk, true);
                                //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                                let docEntrySP = Solped.solped.docentrySP;
                                let infoUsuarioPresupuesto = [{ dbcompanysap: bdPresupuesto }];
                                let resultCancelSolpedPresupuesto = yield helpers_1.default.anularSolpedByIdSL(infoUsuarioPresupuesto[0], docEntrySP);
                                console.log(resultCancelSolpedPresupuesto);
                                //Obtener datos de la solped a aprobar para notificación
                                //Obtenerr Emial de compradores segun la compañia, y area de la solped para colocarlos en copia del mail
                                let arrayMailsCompradoresSL = yield helpers_1.default.getUsuariosComprasAreaSL(infoUsuario[0], Solped.solped.u_nf_depen_solped);
                                let emailCompradores = "";
                                if (arrayMailsCompradoresSL.value.length > 0) {
                                    for (let item of arrayMailsCompradoresSL.value) {
                                        emailCompradores += `${item.Users.eMail},`;
                                    }
                                }
                                ////console.log(emailCompradores);
                                let infoEmail = {
                                    to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email,
                                    //cc:emailCompradores+LineAprovedSolped.aprobador.email,
                                    cc: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : emailCompradores,
                                    subject: `Aprobación Solped ${idSolped}`,
                                    html
                                };
                                //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                                yield helpers_1.default.sendNotification(infoEmail);
                                messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                                ////console.log(messageSolped);
                                arrayAproved.push({ idSolped, messageSolped, infoEmail });
                            }
                        }
                    }
                    else {
                        //connection.rollback();
                        error = true;
                        if (resultLineaAprobacion[0].estadoap === 'A') {
                            messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                            ////console.log(messageSolped);
                            arrayErrors.push({ idSolped, messageSolped });
                            //return res.json({message:messageSolped, status:501});
                        }
                        else {
                            messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                            ////console.log(messageSolped);
                            arrayErrors.push({ idSolped, messageSolped });
                            //return res.json({message:messageSolped, status:501});
                        }
                    }
                }
                if (error) {
                    connection.rollback();
                }
                else {
                    yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo la aprobación de las solicitudes  ${arrayAproved}`);
                    connection.commit();
                }
                res.json({ arrayErrors, arrayAproved });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    //Deprecated Methods
    aprovedMail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idcrypt } = req.params;
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                //Validar token de aprobación
                const lineaAprobacion = yield helpers_1.default.validateToken(idcrypt);
                ////console.log(lineaAprobacion);
                //Obtener datos del token
                const idSolped = lineaAprobacion.infoSolped.id_solped;
                const bdmysql = lineaAprobacion.infoSolped.bdmysql;
                const compania = lineaAprobacion.infoSolped.companysap;
                const id = lineaAprobacion.infoSolped.idlineap;
                const logo = lineaAprobacion.infoSolped.logo;
                const origin = lineaAprobacion.infoSolped.origin;
                let urlbk = req.protocol + '://' + req.get('host');
                let messageSolped = "";
                //Obtener datos de la solped segun id
                let Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                const infoUsuario = {
                    bdmysql,
                    codusersap: Solped.solped.usersap,
                    id: Solped.solped.id_user,
                    companyname: '',
                    dbcompanysap: compania,
                    fullname: Solped.solped.fullname,
                    email: '',
                    id_company: 0,
                    logoempresa: logo,
                    status: '',
                    urlwssap: '',
                    username: ''
                };
                //Consulta de liena de aprobación por id de aprobacion
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield connection.query(queryLineaAprobacion, [id]);
                //////console.log(resultLineaAprobacion);
                //Validar el estado de la linea de aprobación
                if (resultLineaAprobacion[0].estadoap === 'P') {
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                    let resultUpdateLineAproved = yield connection.query(queryUpdateLineAproved, [id]);
                    //Obtener información del proximo aprobador
                    let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, logo, origin, urlbk, resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if (LineAprovedSolped != '') {
                        let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '24h');
                        let html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario, LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, true);
                        //Obtener datos de la solped a aprobar para notificación
                        let infoEmail = {
                            //to: LineAprovedSolped.aprobador.email,
                            to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        };
                        //Envio de notificación al siguiente aprobador con copia al autor
                        yield helpers_1.default.sendNotification(infoEmail);
                        html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario, LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, false);
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email;
                        yield helpers_1.default.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        ////console.log(messageSolped);
                        //req.headers.origin
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        LineAprovedSolped = lineaAprobacion;
                        ////console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
                        //registrar Solped en SAP
                        const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario, dataForSAP);
                        if (resultResgisterSAP.error) {
                            ////console.log(resultResgisterSAP.error.message.value,"rollbak to do");
                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                        }
                        else {
                            ////console.log(resultResgisterSAP.DocEntry,resultResgisterSAP.DocNum);
                            LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                            //Actualizar solpedSAP
                            let docEntry = resultResgisterSAP.DocEntry;
                            let dataUpdateSolpedSAP = {
                                U_AUTOR_PORTAL: Solped.solped.usersap,
                                DocumentLines: [
                                    {
                                        U_NF_NOM_AUT_PORTAL: Solped.solped.usersap,
                                        U_ID_PORTAL: idSolped
                                    }
                                ]
                            };
                            ////console.log(dataUpdateSolpedSAP);
                            ////console.log(JSON.stringify(dataUpdateSolpedSAP));
                            //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);
                            ////console.log(LineAprovedSolped);
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = yield connection.query(queryUpdateSolpedAproved, [idSolped]);
                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = yield helpers_1.default.registerProcApSolpedSAP(infoUsuario, bdmysql, idSolped, resultResgisterSAP.DocNum);
                            let arrayMailsCompradoresSL = yield helpers_1.default.getUsuariosComprasAreaSL(infoUsuario, Solped.solped.u_nf_depen_solped);
                            let emailCompradores = "";
                            if (arrayMailsCompradoresSL.value.length > 0) {
                                for (let item of arrayMailsCompradoresSL.value) {
                                    emailCompradores += `${item.Users.eMail},`;
                                }
                            }
                            //Obtener datos de la solped a aprobar para notificación
                            const html = yield helpers_1.default.loadBodyMailApprovedSolped(infoUsuario, LineAprovedSolped, logo, Solped, '', urlbk, true);
                            let infoEmail = {
                                to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email,
                                //cc:LineAprovedSolped.aprobador.email,
                                cc: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : emailCompradores,
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            };
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            yield helpers_1.default.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            ////console.log(messageSolped);
                            connection.commit();
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                        }
                    }
                }
                else {
                    connection.rollback();
                    if (resultLineaAprobacion[0].estadoap === 'A') {
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        ////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        ////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }
            }
            catch (error) {
                connection.rollback();
                ////console.log(error);
                if (error.name === 'TokenExpiredError') {
                    let messageSolped = `Token expiro`;
                    return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    //res.status(401).json({ message: 'Token expiro ' });
                    //return;
                }
                ////console.log({ message: 'Fallo la autenticación del usuario' });
                return res.redirect(`${origin}/#/pages/notfound`);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    aprovedMail2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const logo = infoUsuario[0].logoempresa;
            const lineaAprobacion = req.body;
            ////console.log(infoUsuario[0],lineaAprobacion);
            let urlbk = req.protocol + '://' + req.get('host');
            const bdPresupuesto = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'COPIA_PRESUPUESTO' : 'PRESUPUESTO';
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                //Validar token de aprobación
                //Obtener datos del token
                const idSolped = lineaAprobacion.infoSolped.id_solped;
                const id = lineaAprobacion.infoSolped.idlineap;
                const origin = lineaAprobacion.infoSolped.origin;
                const comentario = lineaAprobacion.infoSolped.comentario;
                let messageSolped = "";
                //Obtener datos de la solped segun id
                let Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                // Validar presupuesto de la solped 
                let presupuesto = yield helpers_1.default.getPresupuesto(infoUsuario[0], idSolped, bdmysql);
                if (presupuesto.length > 0) {
                    connection.rollback();
                    let message = "";
                    if (presupuesto.length > 1) {
                        message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                    }
                    else {
                        message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                    }
                    //console.log(message);
                    return res.json([{ status: "error", message }]);
                }
                //Consulta de liena de aprobación por id de aprobacion
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield connection.query(queryLineaAprobacion, [id]);
                //Validar el estado de la linea de aprobación
                if (resultLineaAprobacion[0].estadoap === 'P') {
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped Set estadoap = 'A', comments='${comentario}', updated_at= CURRENT_TIMESTAMP where id = ${id}`;
                    ////console.log(queryUpdateLineAproved);
                    let resultUpdateLineAproved = yield connection.query(queryUpdateLineAproved);
                    ////console.log(resultUpdateLineAproved);
                    //Obtener información del proximo aprobador
                    let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, logo, origin, urlbk, resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if (LineAprovedSolped != '') {
                        let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '24h');
                        let html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, true);
                        //Obtener datos de la solped a aprobar para notificación
                        let infoEmail = {
                            //to: LineAprovedSolped.aprobador.email,
                            to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        };
                        //Envio de notificación al siguiente aprobador con copia al autor
                        yield helpers_1.default.sendNotification(infoEmail);
                        html = yield helpers_1.default.loadBodyMailSolpedAp(infoUsuario[0], LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true, false);
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email;
                        yield helpers_1.default.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        ////console.log(messageSolped);
                        //req.headers.origin
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        connection.commit();
                        return res.json(messageSolped);
                    }
                    else {
                        LineAprovedSolped = lineaAprobacion;
                        ////console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
                        //registrar Solped en SAP
                        const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario[0], dataForSAP);
                        if (resultResgisterSAP.error) {
                            ////console.log(resultResgisterSAP.error.message.value,"rollbak to do");
                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                            return res.status(401).json({ messageSolped: resultResgisterSAP.error.message.value });
                        }
                        else {
                            ////console.log(resultResgisterSAP.DocEntry,resultResgisterSAP.DocNum);
                            LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                            //Actualizar solpedSAP
                            let docEntry = resultResgisterSAP.DocEntry;
                            let dataUpdateSolpedSAP = {
                                U_AUTOR_PORTAL: Solped.solped.usersap,
                                DocumentLines: [
                                    {
                                        U_NF_NOM_AUT_PORTAL: Solped.solped.usersap,
                                        U_ID_PORTAL: idSolped
                                    }
                                ]
                            };
                            //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                            let docEntrySP = Solped.solped.docentrySP;
                            let infoUsuarioPresupuesto = [{ dbcompanysap: bdPresupuesto }];
                            let resultCancelSolpedPresupuesto = yield helpers_1.default.anularSolpedByIdSL(infoUsuarioPresupuesto[0], docEntrySP);
                            console.log('Anular Solped Presupuesto', resultCancelSolpedPresupuesto);
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = yield connection.query(queryUpdateSolpedAproved, [idSolped]);
                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = yield helpers_1.default.registerProcApSolpedSAP(infoUsuario[0], bdmysql, idSolped, resultResgisterSAP.DocNum);
                            let arrayMailsCompradoresSL = yield helpers_1.default.getUsuariosComprasAreaSL(infoUsuario[0], Solped.solped.u_nf_depen_solped);
                            let emailCompradores = "";
                            if (arrayMailsCompradoresSL.value.length > 0) {
                                for (let item of arrayMailsCompradoresSL.value) {
                                    emailCompradores += `${item.Users.eMail},`;
                                }
                            }
                            //Obtener datos de la solped a aprobar para notificación
                            const html = yield helpers_1.default.loadBodyMailApprovedSolped(infoUsuario[0], LineAprovedSolped, logo, Solped, '', urlbk, true);
                            let infoEmail = {
                                to: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : LineAprovedSolped.autor.email,
                                //to: LineAprovedSolped.autor.email,
                                cc: (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'ralbor@nitrofert.com.co' : emailCompradores,
                                //cc:'aballesteros@nitrofert.com.co',
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            };
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            yield helpers_1.default.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            ////console.log(messageSolped);
                            connection.commit();
                            //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                            return res.json(messageSolped);
                        }
                    }
                }
                else {
                    connection.rollback();
                    if (resultLineaAprobacion[0].estadoap === 'A') {
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        ////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.status(401).json(messageSolped);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        ////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.status(401).json(messageSolped);
                    }
                }
            }
            catch (error) {
                connection.rollback();
                ////console.log(error);
                let messageSolped = "";
                if (error.name === 'TokenExpiredError') {
                    messageSolped = `Token expiro`;
                    //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    return res.status(401).json(messageSolped);
                    //res.status(401).json({ message: 'Token expiro ' });
                    //return;
                }
                messageSolped = 'Fallo la autenticación del usuario';
                ////console.log({ message: 'Fallo la autenticación del usuario' });
                //return res.redirect(`${origin}/#/pages/notfound`);
                return res.status(401).json(messageSolped);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    listAprobaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const { id } = req.params;
                let queryList = `SELECT * FROM ${bdmysql}.aprobacionsolped t0 WHERE t0.id_solped = ?`;
                let listAprobacionesSolped = yield database_1.db.query(queryList, [id]);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} consulto el listado de aprobaciones de la solped ${id}`);
                res.json(listAprobacionesSolped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    reject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idcrypt } = req.params;
            try {
                ////console.log(await helper.validateToken(idcrypt));
                const lineaAprobacion = yield helpers_1.default.validateToken(idcrypt);
                const idSolped = lineaAprobacion.infoSolped.id_solped;
                const bdmysql = lineaAprobacion.infoSolped.bdmysql;
                const compania = lineaAprobacion.infoSolped.companysap;
                const id = lineaAprobacion.infoSolped.idlineap;
                const logo = lineaAprobacion.infoSolped.logo;
                const origin = lineaAprobacion.infoSolped.origin;
                let messageSolped = "";
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield database_1.db.query(queryLineaAprobacion, [id]);
                ////console.log(resultLineaAprobacion);
                if (resultLineaAprobacion[0].estadoap === 'P') {
                    /*
                    //realiza el proceso de actualización de la linea de aprobacion
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'R' where t0.id = ?`;
                    let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[id]);
    
                    //Actualiza el estado de la seccion de aprobacion
                    let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped set t0.estadoseccion ='I' where t0.id_solped = ? and  t0.estadoseccion='A'`;
                    let resultUpdateSeccionAproved = await db.query(queryUpdateSeccionAproved,[idSolped]);
    
                    //Envia notificación de rechazo */
                    res.redirect(`${origin}/#/reject/solped/${idcrypt}`);
                }
                else {
                    if (resultLineaAprobacion[0].estadoap === 'A') {
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        ////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        ////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }
            }
            catch (error) {
                ////console.log(error);
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({ message: 'Token expiro ' });
                    return;
                }
                ////console.log({ message: 'Fallo la autenticación del usuario' });
                return res.redirect(`${origin}/#/pages/notfound`);
            }
        });
    }
    rejectMail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const logo = infoUsuario[0].logoempresa;
            const lineaAprobacion = req.body;
            ////console.log(infoUsuario[0],lineaAprobacion);
            let urlbk = req.protocol + '://' + req.get('host');
            const bdPresupuesto = (urlbk.includes('localhost') == true || urlbk.includes('-dev.') == true) ? 'COPIA_PRESUPUESTO' : 'PRESUPUESTO';
            try {
                //////console.log(await helper.validateToken(idcrypt));
                //const lineaAprobacion = await helper.validateToken(idcrypt);
                const idSolped = lineaAprobacion.infoSolped.id_solped;
                //const bdmysql = lineaAprobacion.infoSolped.bdmysql;
                //const compania = lineaAprobacion.infoSolped.companysap;
                const id = lineaAprobacion.infoSolped.idlineap;
                //const logo = lineaAprobacion.infoSolped.logo;
                const origin = lineaAprobacion.infoSolped.origin;
                const comentario = lineaAprobacion.infoSolped.coentario;
                let messageSolped = "";
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield database_1.db.query(queryLineaAprobacion, [id]);
                ////console.log(resultLineaAprobacion);
                if (resultLineaAprobacion[0].estadoap === 'P') {
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped Set estadoap = 'R', comments='${comentario}', updated_at= CURRENT_TIMESTAMP where id = ?`;
                    let resultUpdateLineAproved = yield database_1.db.query(queryUpdateLineAproved, [id]);
                    //Actualiza el estado de la seccion de aprobacion 
                    let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped set estadoseccion ='I', updated_at= CURRENT_TIMESTAMP where id_solped = ? and  estadoseccion='A'`;
                    let resultUpdateSeccionAproved = yield database_1.db.query(queryUpdateSeccionAproved, [idSolped]);
                    //Actualiza el estado de la dolped a rechazado 
                    let queryUpdateSolpedRechazado = `Update ${bdmysql}.solped set approved ='R'  where id = ? `;
                    let resultUpdateSolpedRechazado = yield database_1.db.query(queryUpdateSolpedRechazado, [idSolped]);
                    //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                    let Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                    let docEntrySP = Solped.solped.docentrySP;
                    let infoUsuarioPresupuesto = [{ dbcompanysap: bdPresupuesto }];
                    let resultCancelSolpedPresupuesto = yield helpers_1.default.anularSolpedByIdSL(infoUsuarioPresupuesto[0], docEntrySP);
                    console.log(resultCancelSolpedPresupuesto);
                    //Envia notificación de rechazo                
                    messageSolped = `La solped  ${idSolped} fue rechazada`;
                    ////console.log(messageSolped);
                    //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    return res.json(messageSolped);
                }
                else {
                    if (resultLineaAprobacion[0].estadoap === 'A') {
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        ////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.json(messageSolped);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        ////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.json(messageSolped);
                    }
                }
            }
            catch (error) {
                ////console.log(error);
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({ messageSolped: 'Token expiro ' });
                    return;
                }
                ////console.log({ message: 'Fallo la autenticación del usuario' });
                //return res.redirect(`${origin}/#/pages/notfound`);
                res.status(401).json({ messageSolped: 'Fallo la autenticación del usuario' });
            }
        });
    }
    rejectSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                const lineaAprobacion = req.body;
                ////console.log(lineaAprobacion);
                const idSolped = lineaAprobacion.infoSolped.id_solped;
                const bdmysql = lineaAprobacion.infoSolped.bdmysql;
                const compania = lineaAprobacion.infoSolped.companysap;
                const id = lineaAprobacion.infoSolped.idlineap;
                const logo = lineaAprobacion.infoSolped.logo;
                const comments = lineaAprobacion.infoSolped.comments;
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield database_1.db.query(queryLineaAprobacion, [id]);
                if (resultLineaAprobacion[0].estadoap !== 'R') {
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'R', comments='${comments}'  where t0.id = ?`;
                    let resultUpdateLineAproved = yield database_1.db.query(queryUpdateLineAproved, [id]);
                    //Actualiza el estado de la seccion de aprobacion 
                    let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped t0 set t0.estadoseccion ='I',  t0.updated_at= CURRENT_TIMESTAMP where t0.id_solped = ? and  t0.estadoseccion='A'`;
                    let resultUpdateSeccionAproved = yield database_1.db.query(queryUpdateSeccionAproved, [idSolped]);
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateRejecSolped = `Update ${bdmysql}.solped t0 Set t0.approved = 'R'  where t0.id = ?`;
                    let resultUpdateRejecSolped = yield database_1.db.query(queryUpdateRejecSolped, [idSolped]);
                    //Envia notificación de rechazo
                    let Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                    const html = yield helpers_1.default.loadBodyMailRejectSolped(lineaAprobacion, logo, Solped);
                    //////console.log(html);
                    //Obtener datos de la solped a aprobar
                    let infoEmail = {
                        to: lineaAprobacion.autor.email,
                        //cc:lineaAprobacion.aprobador.email,
                        //cc:'aballesteros@',
                        subject: `Notificacion de rechazo Solped ${idSolped}`,
                        html
                    };
                    //////console.log(infoEmail);
                    yield helpers_1.default.sendNotification(infoEmail);
                    connection.commit();
                    res.json([{ status: "ok", message: `La solicitud de pedido # ${idSolped} fue rechazada` }]);
                }
                else {
                    ////console.log("error rject ya fue rechazada");
                    connection.rollback();
                    res.json([{ status: "error", message: `La solicitud # ${idSolped} ya fue rechazada` }]);
                }
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                connection.rollback();
                res.json([{ status: "error", message: err }]);
            }
            finally {
                if (connection)
                    yield connection.release();
            }
        });
    }
    uploadAnexoSolped(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const infoFile = req.body;
            try {
                ////console.log(infoFile);
                ////console.log(req.file);
                let archivo = fs_1.default.readFileSync(req.file.path);
                ////console.log(archivo);
                let anexo = {
                    id_solped: infoFile.solpedID,
                    tipo: infoFile.anexotipo,
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path,
                    encoding: (_d = req.file) === null || _d === void 0 ? void 0 : _d.encoding,
                    mimetype: (_e = req.file) === null || _e === void 0 ? void 0 : _e.mimetype,
                    archivo
                };
                let sqlInsertFileSolped = `Insert into ${bdmysql}.anexos set ?`;
                let resultInsertFileSolped = yield database_1.db.query(sqlInsertFileSolped, [anexo]);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} cargo el archivo ${(_f = req.file) === null || _f === void 0 ? void 0 : _f.originalname} asociado a la solped ${infoFile.solpedID}`);
                res.json({ message: `El archio ${(_g = req.file) === null || _g === void 0 ? void 0 : _g.originalname} fue cargado satisfactoriamente`, ruta: (_h = req.file) === null || _h === void 0 ? void 0 : _h.path, idanexo: resultInsertFileSolped.insertId });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
    borrarAnexoSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const infoFile = req.body;
            let connection = yield database_1.db.getConnection();
            try {
                ////console.log(infoFile);
                let pathFile = path_1.default.resolve(infoFile.ruta.toString());
                let queryDeleteAnexoSolped = `Delete from ${bdmysql}.anexos where id= ${infoFile.idanexo}`;
                ////console.log(queryDeleteAnexoSolped);
                let resultDeleteAnexo = yield connection.query(queryDeleteAnexoSolped, [infoFile.idanexo]);
                if (fs_1.default.existsSync(pathFile)) {
                    ////console.log(pathFile);
                    fs_1.default.unlinkSync(pathFile);
                }
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} elimino el archivo ${infoFile.name} asociado a la solped ${infoFile.idsolped}`);
                res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}` });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    downloadAnexoSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const infoFile = req.body;
            try {
                ////console.log(infoFile);
                let pathFile = path_1.default.resolve(infoFile.ruta.toString());
                ////console.log(__dirname);
                if (fs_1.default.existsSync(pathFile)) {
                    ////console.log(pathFile);
                    //fs.unlinkSync(pathFile);
                    res.download(pathFile);
                    /*let road = fs.createReadStream (pathFile); // Crear entrada de flujo de entrada
                     res.writeHead(200, {
                         'Content-Type': 'application/force-download',
                         'Content-Disposition': 'attachment; filename=name'
                     });
                     
                     road.pipe (res);*/
                }
                //res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}`});
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
    listMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq 189`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //////console.log(data2.value);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2.value);
                }
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listMPS(req, res) {
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
                let status = req.params.status;
                let serie = 0;
                let seriesDoc = yield helpers_1.default.getSeriesXE(infoUsuario[0].dbcompanysap, '1470000113');
                for (let item in seriesDoc) {
                    if (seriesDoc[item].name === 'SPMP') {
                        serie = seriesDoc[item].code;
                    }
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.serie='${serie}' `;
                }
                else {
                    where = ` WHERE  t0.serie='${serie}' `;
                }
                let solped_open_sap = yield helpers_1.default.getSolpedMPopenSL(infoUsuario[0], serie);
                let array_solped_sap = [0];
                for (let solped of solped_open_sap.value) {
                    //////console.log(solped.DocNum);
                    array_solped_sap.push(solped.DocNum);
                }
                // ////console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));
                if (where == '') {
                    where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[', '(').replace(']', ')')} `;
                }
                else {
                    where = where + ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[', '(').replace(']', ')')} `;
                }
                let queryList = `SELECT t0.id, t0.approved, t0.sapdocnum AS "DocNum",
            CONCAT(t0.sapdocnum,'-',t1.linenum) AS "key",
            t0.u_nf_status AS "U_NF_STATUS",
            t1.linenum AS "LineNum",
            t1.itemcode AS "ItemCode",
            t1.dscription AS "ItemDescription",
            t0.nf_lastshippping AS "U_NF_LASTSHIPPPING",
            t0.nf_dateofshipping AS "U_NF_DATEOFSHIPPING",
            t0.reqdate AS "RequriedDate",
            t0.nf_agente AS "U_NF_AGENTE",
            t0.nf_pago AS "U_NF_PAGO",
            t1.quantity AS "Quantity",
            t0.nf_Incoterms AS "U_NT_Incoterms",
            t0.nf_tipocarga AS "U_NF_TIPOCARGA",
            t0.nf_puertosalida AS "U_NF_PUERTOSALIDA",
            t1.whscode AS "WarehouseCode",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.comments AS "Comments",
            t1.unidad AS "MeasureUnit",
            t1.linevendor as "CarCode"
              FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
           
            ORDER BY t0.id DESC`;
                //////console.log(queryList);
                const solped = yield database_1.db.query(queryList);
                ////console.log(solped);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
                res.json(solped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    listMPS2(req, res) {
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
                let status = req.params.status;
                let serie = 0;
                let seriesDoc = yield helpers_1.default.getSeriesXE(infoUsuario[0].dbcompanysap, '1470000113');
                for (let item in seriesDoc) {
                    if (seriesDoc[item].name === 'SPMP') {
                        serie = seriesDoc[item].code;
                    }
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.serie='${serie}' and t0.sapdocnum =0 and t0.approved='N'`;
                }
                else {
                    where = ` WHERE  t0.serie='${serie}' and t0.sapdocnum=0 and t0.approved='N'`;
                }
                //////console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));
                /*if(where==''){
                    where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
                }else{
                    where = where+ ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
                }*/
                let proveedores = yield helpers_1.default.objectToArray(yield helpers_1.default.getProveedoresXE(infoUsuario[0]));
                let solped_open_sap = yield helpers_1.default.getAllSolpedMPopenSL(infoUsuario[0], serie);
                let array_solped_sap = yield helpers_1.default.covertirResultadoSLArray(solped_open_sap);
                //////console.log(solped_open_sap);
                let queryList = `SELECT 
            t0.id, 
            t0.approved, 
            t0.id AS "DocNum",
            CONCAT(t0.id,'-',t0.sapdocnum,'-',t1.linenum) AS "key",
            t0.u_nf_status AS "U_NF_STATUS",
            t1.linenum AS "LineNum",
            t1.itemcode AS "ItemCode",
            t1.dscription AS "ItemDescription",
            CONCAT(t1.itemcode,' - ',t1.dscription) AS "Description",
            t0.nf_lastshippping AS "U_NF_LASTSHIPPPING",
            t0.nf_dateofshipping AS "U_NF_DATEOFSHIPPING",
            t0.reqdate AS "RequriedDate",
            t0.nf_agente AS "U_NF_AGENTE",
            t0.nf_pago AS "U_NF_PAGO",
            t1.quantity AS "Quantity",
            t0.nf_Incoterms AS "U_NT_Incoterms",
            t0.nf_tipocarga AS "U_NF_TIPOCARGA",
            t0.nf_puertosalida AS "U_NF_PUERTOSALIDA",
            t1.whscode AS "WarehouseCode",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.comments AS "Comments",
            t1.unidad AS "MeasureUnit",
            t1.linevendor as "CardCode",
            '' AS "CardName",
            '' AS "ProveedorDS",
            t0.nf_pedmp as "U_NF_PEDMP"
              FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
           
            ORDER BY t0.id DESC`;
                //////console.log(queryList);
                const solpeds = yield database_1.db.query(queryList);
                for (let solped of solpeds) {
                    if (solped.CardCode != '') {
                        solped.CardName = proveedores.filter((data) => data.CardCode === solped.CardCode)[0].CardName;
                        solped.ProveedorDS = `${solped.CardCode} - ${solped.CardName}`;
                    }
                }
                let solicitudesSAP = [];
                //////console.log(solped);
                for (let linea of array_solped_sap) {
                    if (linea.CardCode != '') {
                        linea.CardName = proveedores.filter((data) => data.CardCode === linea.CardCode)[0].CardName;
                        linea.ProveedorDS = `${linea.CardCode} - ${linea.CardName}`;
                    }
                    solicitudesSAP.push({
                        id: linea.id,
                        approved: linea.approved,
                        DocNum: linea.DocNum,
                        key: linea.key,
                        U_NF_STATUS: linea.U_NF_STATUS,
                        LineNum: linea.lineNum,
                        ItemCode: linea.ItemCode,
                        ItemDescription: linea.ItemDescription,
                        Description: `${linea.ItemCode} - ${linea.ItemDescription}`,
                        U_NF_LASTSHIPPPING: linea.U_NF_LASTSHIPPPING,
                        U_NF_DATEOFSHIPPING: linea.U_NF_DATEOFSHIPPING,
                        RequriedDate: linea.RequriedDate,
                        U_NF_AGENTE: linea.U_NF_AGENTE,
                        U_NF_PAGO: linea.U_NF_PAGO,
                        Quantity: linea.Quantity,
                        U_NT_Incoterms: linea.U_NT_Incoterms,
                        U_NF_TIPOCARGA: linea.U_NF_TIPOCARGA,
                        U_NF_PUERTOSALIDA: linea.U_NF_PUERTOSALIDA,
                        WarehouseCode: linea.WarehouseCode,
                        U_NF_MOTONAVE: linea.U_NF_MOTONAVE,
                        Comments: linea.Comments,
                        MeasureUnit: linea.MeasureUnit,
                        CardCode: linea.CardCode,
                        RemainingOpenQuantity: linea.RemainingOpenQuantity,
                        U_NF_PEDMP: linea.U_NF_PEDMP,
                        CardName: linea.CardName != '' ? proveedores.filter((data) => data.CardCode === linea.CardCode)[0].CardName : '',
                        ProveedorDS: linea.ProveedorDS
                    });
                }
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
                let proyeccionesSolicitudes = {
                    proyecciones: solpeds,
                    solicitudesSAP
                };
                //////console.log(proyeccionesSolicitudes);
                res.json(proyeccionesSolicitudes);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    createMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const newSolped = req.body;
            //////console.log(newSolped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let querySolped = `Insert into ${bdmysql}.solped set ?`;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                //newSolped.solped.nf_lastshippping = await helper.format(newSolped.solped.nf_lastshippping);
                //newSolped.solped.nf_dateofshipping = await helper.format(newSolped.solped.nf_dateofshipping);
                let resultInsertSolped = yield connection.query(querySolped, [newSolped.solped]);
                //////console.log(resultInsertSolped);
                let solpedId = resultInsertSolped.insertId;
                let newSolpedDet = [];
                let newSolpedLine = [];
                for (let item in newSolped.solpedDet) {
                    newSolpedLine.push(solpedId);
                    newSolpedLine.push(newSolped.solpedDet[item].linenum);
                    newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                    newSolpedLine.push(newSolped.solpedDet[item].dscription);
                    newSolpedLine.push(yield helpers_1.default.format(newSolped.solpedDet[item].reqdatedet));
                    newSolpedLine.push(newSolped.solpedDet[item].linevendor);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcode);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcodename);
                    newSolpedLine.push(newSolped.solpedDet[item].quantity);
                    newSolpedLine.push(newSolped.solpedDet[item].price);
                    newSolpedLine.push(newSolped.solpedDet[item].moneda);
                    newSolpedLine.push(newSolped.solpedDet[item].trm);
                    newSolpedLine.push(newSolped.solpedDet[item].linetotal);
                    newSolpedLine.push(newSolped.solpedDet[item].tax);
                    newSolpedLine.push(newSolped.solpedDet[item].taxvalor);
                    newSolpedLine.push(newSolped.solpedDet[item].linegtotal);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                    newSolpedLine.push(newSolped.solpedDet[item].whscode);
                    newSolpedLine.push(newSolped.solpedDet[item].id_user);
                    newSolpedLine.push(newSolped.solpedDet[item].unidad);
                    newSolpedLine.push(newSolped.solpedDet[item].zonacode);
                    newSolpedDet.push(newSolpedLine);
                    newSolpedLine = [];
                }
                ////console.log(newSolpedDet);
                let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                    acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user,unidad,zonacode) values ?
            `;
                //////console.log(queryInsertDetSolped);
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //////console.log(resultInsertSolpedDet);
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente el registro de la solped de materia prima No. ${solpedId}`);
                res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`, solpednum: solpedId });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    updateMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const newSolped = req.body;
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let solpedId = newSolped.solped.id;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                newSolped.solped.nf_lastshippping = yield helpers_1.default.format(newSolped.solped.nf_lastshippping);
                newSolped.solped.nf_dateofshipping = yield helpers_1.default.format(newSolped.solped.nf_dateofshipping);
                //////console.log('Encabezado',newSolped.solped);
                //Actualizar encabezado solped 
                let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
                let resultUpdateSolped = yield connection.query(querySolped, [newSolped.solped, solpedId]);
                //////console.log(resultUpdateSolped);
                //Borrar detalle Solped seleccionada
                querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
                let resultDeleteSolpedDet = yield connection.query(querySolped, [solpedId]);
                //////console.log(resultDeleteSolpedDet);
                let newSolpedDet = [];
                let newSolpedLine = [];
                for (let item in newSolped.solpedDet) {
                    newSolpedLine.push(solpedId);
                    newSolpedLine.push(newSolped.solpedDet[item].linenum);
                    newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                    newSolpedLine.push(newSolped.solpedDet[item].dscription);
                    newSolpedLine.push(yield helpers_1.default.format(newSolped.solpedDet[item].reqdatedet));
                    newSolpedLine.push(newSolped.solpedDet[item].linevendor);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcode);
                    newSolpedLine.push(newSolped.solpedDet[item].acctcodename);
                    newSolpedLine.push(newSolped.solpedDet[item].quantity);
                    newSolpedLine.push(newSolped.solpedDet[item].price);
                    newSolpedLine.push(newSolped.solpedDet[item].moneda);
                    newSolpedLine.push(newSolped.solpedDet[item].trm);
                    newSolpedLine.push(newSolped.solpedDet[item].linetotal);
                    newSolpedLine.push(newSolped.solpedDet[item].tax);
                    newSolpedLine.push(newSolped.solpedDet[item].taxvalor);
                    newSolpedLine.push(newSolped.solpedDet[item].linegtotal);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                    newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                    newSolpedLine.push(newSolped.solpedDet[item].whscode);
                    newSolpedLine.push(newSolped.solpedDet[item].id_user);
                    newSolpedDet.push(newSolpedLine);
                    newSolpedLine = [];
                }
                ////console.log('Detalle',newSolpedDet);
                let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //////console.log(resultInsertSolpedDet);
                //Si la solped ya fue enviada a SAP, actualizar la info en SAP
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped de materia prima No. ${solpedId}`);
                res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    updateCantidadMP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const newSolped = req.body;
            //////console.log(newSolped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let { idProyeccion, cantidadProyectada, item, fechaEditar, linenum } = newSolped;
                //let querySolped = `Update ${bdmysql}.solped_det set quantity = ${cantidadProyectada}  where id_solped = ? and itemcode = ?`;
                let querySolped = `UPDATE  ${bdmysql}.solped_det t1 
              INNER JOIN ${bdmysql}.solped t0 ON t0.id = t1.id_solped 
              SET t1.quantity =${cantidadProyectada}, t0.reqdate = '${yield helpers_1.default.format(fechaEditar)}' 
              WHERE t0.id =? AND t1.itemcode = ? AND t1.linenum = ?`;
                let resultUpdateSolped = yield connection.query(querySolped, [idProyeccion, item, linenum]);
                //////console.log(resultUpdateSolped);
                connection.commit();
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped de materia prima No. ${idProyeccion}`);
                res.json({ message: `Se realizo correctamnente la actualización de la solped ${idProyeccion}` });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
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
    enviarSolpedSAP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const { id } = req.body;
            ////console.log(req.body);
            try {
                let infoSolped = yield helpers_1.default.getSolpedById(id, bdmysql);
                let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(infoSolped);
                //registrar Solped en SAP
                const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario[0], dataForSAP);
                //////console.log(resultResgisterSAP);
                if (resultResgisterSAP.error) {
                    ////console.log(resultResgisterSAP.error.message.value);
                    res.json({ err: resultResgisterSAP.error.message.value, status: 501 });
                }
                else {
                    //Actualizar  sapdocnum, estado de aprobacion y de solped
                    let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C', t0.u_nf_status='Solicitado'  where t0.id = ?`;
                    let resultUpdateSolpedAproved = yield database_1.db.query(queryUpdateSolpedAproved, [id]);
                    yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} envio la solped ${id} a SAP y se registro correctamente con el No. ${resultResgisterSAP.DocNum}`);
                    let messageSolped = `La solped ${id} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                    res.json({ message: messageSolped });
                }
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
    actualizarSolpedSAP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const infoSolped = req.body;
            //////console.log(req.body);
            let id = infoSolped.solped.id;
            let serie = infoSolped.solped.serie;
            let DocNum = infoSolped.solped.sapdocnum;
            try {
                let infoSolped = yield helpers_1.default.getSolpedById(id, bdmysql);
                let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(infoSolped);
                //Obtener DocEntry de la solpred desde sap
                let idSolped = yield helpers_1.default.getSolpedByIdSL(infoUsuario[0], DocNum, serie);
                let DocEntry = idSolped.value[0].DocEntry;
                //actualizar Solped en SAP
                let resultUpdateSolped = yield helpers_1.default.updateSolpedSAP(infoUsuario[0], dataForSAP, DocEntry);
                //////console.log(resultUpdateSolped);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} actualizao correctamente la solped ${DocNum} en SAP`);
                res.json({ message: 'Se realizo la actualizacon de la solped en SAP' });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
    listOCMP(req, res) {
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
                let status = req.params.status;
                let listadoOCMP = yield helpers_1.default.getOcMPByStatusSL(infoUsuario[0], status);
                res.json(listadoOCMP);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    actualizarPedidoSAP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const infoPedido = req.body;
            //////console.log(req.body);
            let DocEntry = infoPedido.DocEntry;
            let Datapedido = infoPedido.pedidoData;
            let DocNum = infoPedido.DocNum;
            try {
                //actualizar Pedido en SAP
                let resultUpdatePedido = yield helpers_1.default.updatePedidoSAP(infoUsuario[0], Datapedido, DocEntry);
                //console.log(resultUpdatePedido);
                yield helpers_1.default.logaccion(infoUsuario[0], `El usuario ${infoUsuario[0].username} actualizao correctamente el pedido ${DocNum} en SAP`);
                res.json({ message: `Se realizo la actualizacon del pedido ${DocNum} en SAP` });
            }
            catch (err) {
                // Print errors
                ////console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
    listInMP(req, res) {
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
                //let status = req.params.status;
                //let listadoOCMP = await helper.getEntradasMPSL( infoUsuario[0]);
                let listadoOCMP = yield helpers_1.default.getEntradasMPXE(infoUsuario[0]);
                //////console.log('Entradas',listadoOCMP);
                res.json(listadoOCMP);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const solpedController = new SolpedController();
exports.default = solpedController;
