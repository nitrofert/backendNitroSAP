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
                //console.log(await helper.loginWsSAP(infoUsuario[0]));
                let where = "";
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.id_user=${infoUsuario[0].id} `;
                }
                if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
                    where = ` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') `;
                }
                //console.log(decodedToken);
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
                // console.log(queryList);
                const solped = yield database_1.db.query(queryList);
                //console.log(solped);
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
            //console.log(newSolped.solped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let querySolped = `Insert into ${bdmysql}.solped set ?`;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                let resultInsertSolped = yield connection.query(querySolped, [newSolped.solped]);
                //console.log(resultInsertSolped);
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
                //console.log(newSolpedDet);
                let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //console.log(resultInsertSolpedDet);
                connection.commit();
                res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`, solpednum: solpedId });
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
                res.json(solpedObject);
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
            console.log(newSolped);
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
                //console.log(resultUpdateSolped);
                //Borrar detalle Solped seleccionada
                querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
                let resultDeleteSolpedDet = yield connection.query(querySolped, [solpedId]);
                //console.log(resultDeleteSolpedDet);
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
                console.log(newSolpedDet);
                let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //console.log(resultInsertSolpedDet);
                connection.commit();
                res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });
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
            console.log(arraySolpedId);
            let connection = yield database_1.db.getConnection();
            yield connection.beginTransaction();
            try {
                for (let id of arraySolpedId) {
                    let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'C', t0.status='C' where t0.id in (?)`;
                    const result = yield connection.query(queryUpdateSolped, [id]);
                }
                connection.commit();
                res.json({ status: "ok", message: `Las solicitudes ${arraySolpedId} seeccionadas fueron canceladas.` });
            }
            catch (err) {
                // Print errors
                console.log(err);
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
            const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const origin = req.headers.origin;
            //Obtener array de id de solped seleccionadas
            const arraySolpedId = req.body;
            let urlbk = req.protocol + '://' + req.get('host');
            console.log(arraySolpedId);
            //Obtener aray de modelos de autorización para la aprobacion de la solped SAP
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
            //console.log(url2);
            let connection = yield database_1.db.getConnection();
            yield connection.beginTransaction();
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
                //console.log(response2.body); 
                const data2 = yield response2.json();
                console.log(data2);
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
                //console.log(arrayModelos);
                //Recorrer el array de ids de solpeds seleccionadas para aprobación e identificar dentro del array de modelos  los posibles modelos que se pueden aplicar a cada solped
                let Solped;
                let modelos = [];
                let modeloid = 0;
                let modelosAprobacion;
                let arrayResult = [];
                let errorInsertAprobacion = false;
                for (let id of arraySolpedId) {
                    //Obtener la info de la solped segun el id
                    Solped = yield helpers_1.default.getSolpedById(id, bdmysql);
                    //filtrar los modelos segun el usuario autor y area de la solped
                    modelos = arrayModelos.filter(modelo => modelo.autorusercode === Solped.solped.usersap && modelo.area === Solped.solped.u_nf_depen_solped);
                    console.log(modelos);
                    //Recorrer los modelos filtrados para evaluar las condiciones en la solped
                    try {
                        //let newAprobacion:any[] = [];
                        let newAprobacionLine = [];
                        for (let modelo of modelos) {
                            //Query que valida si la solped cumple con la condicion dada
                            let queryModelo = `SELECT (SUM(t1.linetotal)/t0.trm) AS total
                                        FROM ${bdmysql}.solped t0 
                                        INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id 
                                        WHERE t0.id = ${id}
                                        HAVING total ${modelo.condicion}`;
                            console.log(queryModelo);
                            const result = yield database_1.db.query(queryModelo);
                            console.log(result.length);
                            //Si el resultado de la consulta es mayo a cero se toma el id del modelo valido
                            if (result.length > 0) {
                                modeloid = modelo.modeloid;
                                console.log(modeloid);
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
                                console.log(newAprobacionLine);
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
                                console.log(resultInsertnewAprobacion);
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
                                //res.json({message:`Se realizo correctamnente el registro de la solped`});
                            }
                        }
                        connection.commit();
                    }
                    catch (err) {
                        // Print errors
                        console.log(err);
                        // Roll back the transaction
                        connection.rollback();
                        res.json([{ status: "error", message: err }]);
                    }
                }
                if (!errorInsertAprobacion) {
                    //notificacion de envio aprobación solped x cada solped seleccionada
                    let solpedNotificacion;
                    for (let idSolped of arraySolpedId) {
                        //obtener remitente y siguiente destinarario de aprobación solped
                        solpedNotificacion = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                        let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, infoUsuario[0].logoempresa, origin);
                        if (LineAprovedSolped != '') {
                            let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '240h');
                            console.log(aprobadorCrypt);
                            const html = yield helpers_1.default.loadBodyMailSolpedAp(LineAprovedSolped, infoUsuario[0].logoempresa, solpedNotificacion, aprobadorCrypt, urlbk);
                            //console.log(html);
                            //Obtener datos de la solped a aprobar
                            let infoEmail = {
                                to: LineAprovedSolped.aprobador.email,
                                cc: LineAprovedSolped.autor.email,
                                subject: `Solicitud de aprobación Solped ${idSolped}`,
                                html
                            };
                            yield helpers_1.default.sendNotification(infoEmail);
                        }
                        else {
                            console.log(`No existe modelo de aprobación para la solped ${idSolped} `);
                        }
                    }
                }
                //console.log((solpedObject));
                res.json(arrayResult);
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
            //console.log(arraySolpedId);
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
                    //Obtener la informacipn de la solped ppor id
                    Solped = yield helpers_1.default.getSolpedById(idSolped, bdmysql);
                    //Consulta de liena de aprobación del usaurio aprobador
                    let queryLineaAprobacion = `Select * 
                                            from ${bdmysql}.aprobacionsolped t0 
                                            where t0.id_solped = ${idSolped} and 
                                                  t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                  t0.estadoseccion='A'`;
                    console.log(queryLineaAprobacion);
                    let resultLineaAprobacion = yield connection.query(queryLineaAprobacion);
                    console.log(resultLineaAprobacion);
                    //Validar el estado de la linea de aprobación
                    if (resultLineaAprobacion[0].estadoap === 'P') {
                        //realiza el proceso de actualización de la linea de aprobacion  
                        let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                        let resultUpdateLineAproved = yield connection.query(queryUpdateLineAproved, [resultLineaAprobacion[0].id]);
                        //console.log(resultUpdateLineAproved);
                        //Obtener información del proximo aprobador
                        let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, logo, req.headers.origin, resultLineaAprobacion[0].id);
                        console.log(LineAprovedSolped);
                        if (LineAprovedSolped != '') {
                            let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '240h');
                            console.log(aprobadorCrypt);
                            const html = yield helpers_1.default.loadBodyMailSolpedAp(LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true);
                            //Obtener datos de la solped a aprobar para notificación
                            let infoEmail = {
                                to: LineAprovedSolped.aprobador.email,
                                cc: LineAprovedSolped.autor.email,
                                subject: `Solicitud de aprobación Solped ${idSolped}`,
                                html
                            };
                            //Envio de notificación al siguiente aprobador con copia al autor
                            yield helpers_1.default.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                            console.log(messageSolped);
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
                            console.log(LineAprovedSolped);
                            //Generar data para registro de la solped en SAP
                            let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
                            //registrar Solped en SAP
                            const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario[0], dataForSAP);
                            console.log(resultResgisterSAP);
                            if (resultResgisterSAP.error) {
                                error = true;
                                console.log(resultResgisterSAP.error.message.value);
                                arrayErrors.push({ idSolped, messageSolped: resultResgisterSAP.error.message.value });
                            }
                            else {
                                console.log(resultResgisterSAP.DocNum);
                                LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                                console.log(LineAprovedSolped);
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
                                console.log(dataUpdateSolpedSAP);
                                console.log(JSON.stringify(dataUpdateSolpedSAP));
                                //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);
                                //Actualizar  sapdocnum, estado de aprobacion y de solped
                                let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                                let resultUpdateSolpedAproved = yield connection.query(queryUpdateSolpedAproved, [idSolped]);
                                //Registrar proceso de aprobacion solped en SAP
                                let resultResgisterProcApSA = yield helpers_1.default.registerProcApSolpedSAP(infoUsuario[0], bdmysql, idSolped, resultResgisterSAP.DocNum);
                                const html = yield helpers_1.default.loadBodyMailApprovedSolped(LineAprovedSolped, logo, Solped, '', urlbk, true);
                                //Obtener datos de la solped a aprobar para notificación
                                let infoEmail = {
                                    to: LineAprovedSolped.autor.email,
                                    cc: LineAprovedSolped.aprobador.email,
                                    subject: `Aprobación Solped ${idSolped}`,
                                    html
                                };
                                //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                                yield helpers_1.default.sendNotification(infoEmail);
                                messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                                console.log(messageSolped);
                                arrayAproved.push({ idSolped, messageSolped, infoEmail });
                            }
                        }
                    }
                    else {
                        //connection.rollback();
                        error = true;
                        if (resultLineaAprobacion[0].estadoap === 'A') {
                            messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                            console.log(messageSolped);
                            arrayErrors.push({ idSolped, messageSolped });
                            //return res.json({message:messageSolped, status:501});
                        }
                        else {
                            messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                            console.log(messageSolped);
                            arrayErrors.push({ idSolped, messageSolped });
                            //return res.json({message:messageSolped, status:501});
                        }
                    }
                }
                if (error) {
                    connection.rollback();
                }
                else {
                    connection.commit();
                }
                res.json({ arrayErrors, arrayAproved });
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
    aprovedMail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idcrypt } = req.params;
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                //Validar token de aprobación
                const lineaAprobacion = yield helpers_1.default.validateToken(idcrypt);
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
                //Consulta de liena de aprobación por id de aprobacion
                let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
                let resultLineaAprobacion = yield connection.query(queryLineaAprobacion, [id]);
                //console.log(resultLineaAprobacion);
                //Validar el estado de la linea de aprobación
                if (resultLineaAprobacion[0].estadoap === 'P') {
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                    let resultUpdateLineAproved = yield connection.query(queryUpdateLineAproved, [id]);
                    //Obtener información del proximo aprobador
                    let LineAprovedSolped = yield helpers_1.default.getNextLineAprovedSolped(idSolped, bdmysql, compania, logo, origin, resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if (LineAprovedSolped != '') {
                        let aprobadorCrypt = yield helpers_1.default.generateToken(LineAprovedSolped, '240h');
                        const html = yield helpers_1.default.loadBodyMailSolpedAp(LineAprovedSolped, logo, Solped, aprobadorCrypt, urlbk, true);
                        //Obtener datos de la solped a aprobar para notificación
                        let infoEmail = {
                            to: LineAprovedSolped.aprobador.email,
                            cc: LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        };
                        //Envio de notificación al siguiente aprobador con copia al autor
                        yield helpers_1.default.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        console.log(messageSolped);
                        //req.headers.origin
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        LineAprovedSolped = lineaAprobacion;
                        console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(Solped);
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
                        //registrar Solped en SAP
                        const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario, dataForSAP);
                        if (resultResgisterSAP.error) {
                            console.log(resultResgisterSAP.error.message.value, "rollbak to do");
                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                        }
                        else {
                            console.log(resultResgisterSAP.DocEntry, resultResgisterSAP.DocNum);
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
                            console.log(dataUpdateSolpedSAP);
                            console.log(JSON.stringify(dataUpdateSolpedSAP));
                            //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);
                            console.log(LineAprovedSolped);
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = yield connection.query(queryUpdateSolpedAproved, [idSolped]);
                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = yield helpers_1.default.registerProcApSolpedSAP(infoUsuario, bdmysql, idSolped, resultResgisterSAP.DocNum);
                            //Obtener datos de la solped a aprobar para notificación
                            const html = yield helpers_1.default.loadBodyMailApprovedSolped(LineAprovedSolped, logo, Solped, '', urlbk, true);
                            let infoEmail = {
                                to: LineAprovedSolped.autor.email,
                                cc: LineAprovedSolped.aprobador.email,
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            };
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            yield helpers_1.default.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            console.log(messageSolped);
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
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }
            }
            catch (error) {
                connection.rollback();
                console.log(error);
                if (error.name === 'TokenExpiredError') {
                    let messageSolped = `Token expiro`;
                    return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    //res.status(401).json({ message: 'Token expiro ' });
                    //return;
                }
                console.log({ message: 'Fallo la autenticación del usuario' });
                return res.redirect(`${origin}/#/pages/notfound`);
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
                console.log(yield helpers_1.default.validateToken(idcrypt));
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
                console.log(resultLineaAprobacion);
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
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                    else {
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }
            }
            catch (error) {
                console.log(error);
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({ message: 'Token expiro ' });
                    return;
                }
                console.log({ message: 'Fallo la autenticación del usuario' });
                return res.redirect(`${origin}/#/pages/notfound`);
            }
        });
    }
    rejectSolped(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                const lineaAprobacion = req.body;
                console.log(lineaAprobacion);
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
                    //console.log(html);
                    //Obtener datos de la solped a aprobar
                    let infoEmail = {
                        to: lineaAprobacion.autor.email,
                        cc: lineaAprobacion.aprobador.email,
                        subject: `Notificacion de rechazo Solped ${idSolped}`,
                        html
                    };
                    //console.log(infoEmail);
                    yield helpers_1.default.sendNotification(infoEmail);
                    connection.commit();
                    res.json([{ status: "ok", message: `La solicitud de pedido # ${idSolped} fue rechazada` }]);
                }
                else {
                    console.log("error rject ya fue rechazada");
                    connection.rollback();
                    res.json([{ status: "error", message: `La solicitud # ${idSolped} ya fue rechazada` }]);
                }
            }
            catch (err) {
                // Print errors
                console.log(err);
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
        var _a, _b, _c, _d, _e;
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
                console.log(infoFile);
                console.log(req.file);
                let anexo = {
                    id_solped: infoFile.solpedID,
                    tipo: infoFile.anexotipo,
                    nombre: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
                    size: (_b = req.file) === null || _b === void 0 ? void 0 : _b.size,
                    ruta: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path
                };
                let sqlInsertFileSolped = `Insert into ${bdmysql}.anexos set ?`;
                let resultInsertFileSolped = yield database_1.db.query(sqlInsertFileSolped, [anexo]);
                res.json({ message: `El archio ${(_d = req.file) === null || _d === void 0 ? void 0 : _d.originalname} fue cargado satisfactoriamente`, ruta: (_e = req.file) === null || _e === void 0 ? void 0 : _e.path, idanexo: resultInsertFileSolped.insertId });
            }
            catch (err) {
                // Print errors
                console.log(err);
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
                console.log(infoFile);
                let pathFile = path_1.default.resolve(infoFile.ruta.toString());
                let queryDeleteAnexoSolped = `Delete from ${bdmysql}.anexos where id= ${infoFile.idanexo}`;
                console.log(queryDeleteAnexoSolped);
                let resultDeleteAnexo = yield connection.query(queryDeleteAnexoSolped, [infoFile.idanexo]);
                if (fs_1.default.existsSync(pathFile)) {
                    console.log(pathFile);
                    fs_1.default.unlinkSync(pathFile);
                }
                connection.commit();
                res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}` });
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
                console.log(infoFile);
                let pathFile = path_1.default.resolve(infoFile.ruta.toString());
                console.log(__dirname);
                if (fs_1.default.existsSync(pathFile)) {
                    console.log(pathFile);
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
                console.log(err);
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
                    console.log(data2.value);
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
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    where = ` WHERE t0.id_user=${infoUsuario[0].id} and t0.u_nf_status='${status}' `;
                }
                else {
                    where = ` WHERE  t0.u_nf_status='${status}' `;
                }
                //console.log(decodedToken);
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
            '' AS "Incoterms",
            t0.nf_tipocarga AS "U_NF_TIPOCARGA",
            t0.nf_puertosalida AS "U_NF_PUERTOSALIDA",
            t1.whscode AS "WarehouseCode",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.comments AS "Comments"
              FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
           
            ORDER BY t0.id DESC`;
                //console.log(queryList);
                const solped = yield database_1.db.query(queryList);
                //console.log(solped);
                res.json(solped);
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
            //console.log(newSolped.solped);
            let connection = yield database_1.db.getConnection();
            try {
                yield connection.beginTransaction();
                let querySolped = `Insert into ${bdmysql}.solped set ?`;
                newSolped.solped.docdate = yield helpers_1.default.format(newSolped.solped.docdate);
                newSolped.solped.docduedate = yield helpers_1.default.format(newSolped.solped.docduedate);
                newSolped.solped.taxdate = yield helpers_1.default.format(newSolped.solped.taxdate);
                newSolped.solped.reqdate = yield helpers_1.default.format(newSolped.solped.reqdate);
                newSolped.solped.nf_lastshippping = yield helpers_1.default.format(newSolped.solped.nf_lastshippping);
                newSolped.solped.nf_dateofshipping = yield helpers_1.default.format(newSolped.solped.nf_dateofshipping);
                let resultInsertSolped = yield connection.query(querySolped, [newSolped.solped]);
                //console.log(resultInsertSolped);
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
                //console.log(newSolpedDet);
                let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //console.log(resultInsertSolpedDet);
                connection.commit();
                res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`, solpednum: solpedId });
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
                console.log('Encabezado', newSolped.solped);
                //Actualizar encabezado solped 
                let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
                let resultUpdateSolped = yield connection.query(querySolped, [newSolped.solped, solpedId]);
                //console.log(resultUpdateSolped);
                //Borrar detalle Solped seleccionada
                querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
                let resultDeleteSolpedDet = yield connection.query(querySolped, [solpedId]);
                //console.log(resultDeleteSolpedDet);
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
                console.log('Detalle', newSolpedDet);
                let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
                const resultInsertSolpedDet = yield connection.query(queryInsertDetSolped, [newSolpedDet]);
                //console.log(resultInsertSolpedDet);
                //Si la solped ya fue enviada a SAP, actualizar la info en SAP
                connection.commit();
                res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });
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
            console.log(req.body);
            try {
                let infoSolped = yield helpers_1.default.getSolpedById(id, bdmysql);
                let dataForSAP = yield helpers_1.default.loadInfoSolpedToJSONSAP(infoSolped);
                //registrar Solped en SAP
                const resultResgisterSAP = yield helpers_1.default.registerSolpedSAP(infoUsuario[0], dataForSAP);
                console.log(resultResgisterSAP);
                if (resultResgisterSAP.error) {
                    console.log(resultResgisterSAP.error.message.value);
                    res.json({ err: resultResgisterSAP.error.message.value, status: 501 });
                }
                else {
                    //Actualizar  sapdocnum, estado de aprobacion y de solped
                    let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                    let resultUpdateSolpedAproved = yield database_1.db.query(queryUpdateSolpedAproved, [id]);
                    let messageSolped = `La solped ${id} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                    res.json({ message: messageSolped });
                }
            }
            catch (err) {
                // Print errors
                console.log(err);
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
            console.log(req.body);
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
                console.log(resultUpdateSolped);
                res.json({ message: 'Se realizo la actualizacon de la solped en SAP' });
            }
            catch (err) {
                // Print errors
                console.log(err);
                // Roll back the transaction
                res.json({ err, status: 501 });
            }
        });
    }
}
const solpedController = new SolpedController();
exports.default = solpedController;
