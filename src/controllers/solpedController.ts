import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import path from 'path';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";
import fs from 'fs';


class SolpedController {

    

    public async listadoSolpeds(req: Request, res: Response) { 
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
       
            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                //where = ` WHERE t0.id_user=${infoUsuario[0].id} and t2.name!='SPMP'  and t0.approved !='A'`;
                where = ` WHERE t0.id_user=${infoUsuario[0].id} and t2.name!='SPMP' `;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                where = ` WHERE t2.name!='SPMP' and t0.approved !='A'`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
               
                where =` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and 
                               t2.name!='SPMP' and 
                               t0.approved ='P'`;
            }

            ////////console.log(decodedToken);
            let queryList = `SELECT t0.id,
                                    t0.id_user,
                                    t0.usersap,
                                    t0.fullname,
                                    t0.serie,
                                    t2.name as serieStr,
                                    t0.doctype,
                                    t0.status,
                                    t0.sapdocnum,
                                    t0.docdate,
                                    t0.docduedate,
                                    t0.taxdate,
                                    t0.reqdate,
                                    t0.u_nf_depen_solped,
                                    t0.approved,
                                    t0.comments,t0.trm,
                                    (CASE
                                        WHEN t0.approved = 'P' THEN (SELECT t2.nombreaprobador 
                                                                     FROM ${bdmysql}.aprobacionsolped t2 
                                                                     WHERE t2.id_solped = t0.id AND t2.estadoap ='P' 
                                                                     ORDER BY t2.nivel ASC LIMIT 1)
                                        WHEN t0.approved = 'R' THEN (SELECT t2.nombreaprobador 
                                                                     FROM ${bdmysql}.aprobacionsolped t2 
                                                                     WHERE t2.id_solped = t0.id AND t2.estadoap ='R' 
                                                                     ORDER BY t2.nivel ASC LIMIT 1)
                                        ELSE ""
                                    END) aprobador,
                                    (CASE
                                        WHEN t0.approved = 'P' THEN (SELECT t2.usersapaprobador 
                                                                     FROM ${bdmysql}.aprobacionsolped t2 
                                                                     WHERE t2.id_solped = t0.id AND t2.estadoap ='P' 
                                                                     ORDER BY t2.nivel ASC LIMIT 1)
                                        WHEN t0.approved = 'R' THEN (SELECT t2.usersapaprobador 
                                                                     FROM ${bdmysql}.aprobacionsolped t2 
                                                                     WHERE t2.id_solped = t0.id AND t2.estadoap ='R' 
                                                                     ORDER BY t2.nivel ASC LIMIT 1)
                                        ELSE ""
                                    END) usersapaprobador,
                                    SUM(linetotal) AS "subtotal",
                                    SUM(taxvalor) AS "impuestos",
                                    SUM(linegtotal) AS "total"
                            FROM    ${bdmysql}.solped t0
                            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
                            INNER JOIN ${bdmysql}.series t2 ON t2.code = t0.serie
                            ${where}
                            GROUP BY 
                                    t0.id,
                                    t0.id_user,
                                    t0.usersap,
                                    t0.fullname,
                                    t0.serie,
                                    t2.name,
                                    t0.doctype,
                                    t0.status,
                                    t0.sapdocnum,
                                    t0.docdate,
                                    t0.docduedate,
                                    t0.taxdate,
                                    t0.reqdate,
                                    t0.u_nf_depen_solped,
                                    t0.approved,
                                    t0.comments,t0.trm
                            ORDER BY t0.id DESC`;

           console.log(queryList);
           await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);

            const solped = await db.query(queryList);
            ////console.log(solped);
            res.json(solped);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listAprobadores(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);

    
            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.id_user=${infoUsuario[0].id} and  t2.name!='SPMP' and t0.approved = 'A' and t0.sapdocnum != 0`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                where = ` WHERE  t2.name!='SPMP' and t0.approved = 'A' and t0.sapdocnum != 0`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
               
                where =` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and  t2.name!='SPMP' and t0.approved = 'A' and t0.sapdocnum != 0`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Comprador').length > 0) {
                where = ` WHERE  t2.name!='SPMP' and t0.approved = 'A' and t0.sapdocnum != 0`; 
            }


        

            ////////console.log(decodedToken);
            let queryList = `SELECT t0.id,
                                    t0.id_user,
                                    t0.usersap,
                                    t0.fullname,
                                    t0.serie,
                                    t2.name as serieStr,
                                    t0.doctype,
                                    t0.status,
                                    t0.sapdocnum,
                                    t0.docdate,
                                    t0.docduedate,
                                    t0.taxdate,
                                    t0.reqdate,
                                    t0.u_nf_depen_solped,
                                    t0.approved,
                                    (select max(tt0.updated_at) from ${bdmysql}.aprobacionsolped tt0 where tt0.id_solped = t0.id and estadoap='A') as fechaap,
                                    t0.comments,
                                    t0.trm,
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
                                    SUM(linetotal) AS "subtotal",
                                    SUM(taxvalor) AS "impuestos",
                                    SUM(linegtotal) AS "total"
                            FROM ${bdmysql}.solped t0
                            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
                            INNER JOIN ${bdmysql}.series t2 ON t2.code = t0.serie
                                    ${where}
                            GROUP BY 
                                    t0.id,
                                    t0.id_user,
                                    t0.usersap,
                                    t0.fullname,
                                    t0.serie,
                                    t2.name,
                                    t0.doctype,
                                    t0.status,
                                    t0.sapdocnum,
                                    t0.docdate,
                                    t0.docduedate,
                                    t0.taxdate,
                                    t0.reqdate,
                                    t0.u_nf_depen_solped,
                                    t0.approved,
                                    t0.comments,
                                    t0.trm
                                ORDER BY t0.id DESC`;

           //console.log(queryList);
           await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);

            const solped = await db.query(queryList);
            ////////console.log(solped);
            res.json(solped);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }


    public async create(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        ////////console.log(newSolped.solped);
        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.solped set ?`;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);

            let resultInsertSolped = await connection.query(querySolped, [newSolped.solped]);
            console.log(resultInsertSolped);

            let solpedId = resultInsertSolped.insertId;
            
            /*let newSolpedDet = [];
            let newSolpedLine = [];
            for (let item in newSolped.solpedDet) {
                newSolpedLine.push(solpedId);
                newSolpedLine.push(newSolped.solpedDet[item].linenum);
                newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                newSolpedLine.push(newSolped.solpedDet[item].dscription);
                newSolpedLine.push(await helper.format(newSolped.solpedDet[item].reqdatedet));
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
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode)
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                newSolpedLine.push(newSolped.solpedDet[item].whscode);
                newSolpedLine.push(newSolped.solpedDet[item].id_user);
                newSolpedDet.push(newSolpedLine);
                newSolpedLine = [];
            }

            ////////console.log(newSolpedDet);
            let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);
            */
            ////////console.log(resultInsertSolpedDet);
            
            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente el registro de la solped ${solpedId}`);
            res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`,solpednum:solpedId });

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }


    }

    public async createDetail(req: Request, res: Response): Promise<void> {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        ////console.log(newSolped);
        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let solpedId = newSolped.id;
            let newSolpedDet:any[] = [];
            let newSolpedLine:any[] = [];
            for (let item in newSolped.solpedDet) {
                newSolpedLine.push(solpedId);
                newSolpedLine.push(newSolped.solpedDet[item].linenum);
                newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                newSolpedLine.push(newSolped.solpedDet[item].dscription);
                newSolpedLine.push(await helper.format(newSolped.solpedDet[item].reqdatedet));
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
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode)
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                newSolpedLine.push(newSolped.solpedDet[item].whscode);
                newSolpedLine.push(newSolped.solpedDet[item].id_user);
                newSolpedLine.push(newSolped.solpedDet[item].proyecto);
                newSolpedLine.push(newSolped.solpedDet[item].subproyecto);
                newSolpedLine.push(newSolped.solpedDet[item].etapa);
                newSolpedLine.push(newSolped.solpedDet[item].actividad);

                newSolpedDet.push(newSolpedLine);
                newSolpedLine = [];
            }

            ////////console.log(newSolpedDet);
            let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user,proyecto,subproyecto,etapa,actividad) values ?
            `;
            console.log(queryInsertDetSolped, newSolpedDet);
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            //console.log('resultInsertSolpedDet ',resultInsertSolpedDet);
            
            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente el registro de la solped ${solpedId}`);
            res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`,solpednum:solpedId });


        } catch (err) {
            // Print errors
            console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }

    }

    public async getSolpedById(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            const { id } = req.params;
            let solpedObject = await helper.getSolpedById(id, bdmysql);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} consulto la información de la solped ${id}`);

            

            res.json(solpedObject);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async getAnexoSolpedById(req: Request, res: Response){
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            const { id, id2 } = req.params;
            let solpedObject = await helper.getSolpedById(id, bdmysql);
            let anexos = solpedObject.anexos;

            let anexo = anexos.filter((item: { id: string; }) => item.id  == id2 );
           
            let anexoBase64:string="";
            if(anexo[0].archivo!=null){
                 //anexoBase64 = anexo[0].archivo.toString('base64');
                 anexoBase64 = anexo[0].archivo;// .toString();

                 var pattern=/^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
                 //If the inputString is NOT a match
                 if (!pattern.test(anexo[0].archivo)) {
                    //////console.log("no base64 found");
                    anexoBase64 = anexo[0].archivo.toString('base64');
                 } else {
                    //////console.log("base64 found");
                    anexoBase64 = anexo[0].archivo.toString();
                 }
                 
            }
            
            ////////console.log(anexoBase64);

            
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} consulto la información del anexo ${id2} de la solped ${id}`);

            res.json({data: anexoBase64});

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async update(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        //////console.log(newSolped);

        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let solpedId = parseInt(newSolped.solped.id);
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);
            //Actualizar encabezado solped 
            let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
            let resultUpdateSolped = await connection.query(querySolped, [newSolped.solped, solpedId]);
            ////////console.log(resultUpdateSolped);

            //Borrar detalle Solped seleccionada
            querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
            let resultDeleteSolpedDet = await connection.query(querySolped, [solpedId]);
            ////////console.log(resultDeleteSolpedDet);

            /*
            let newSolpedDet = [];
            let newSolpedLine = [];
            for (let item in newSolped.solpedDet) {
                newSolpedLine.push(solpedId);
                newSolpedLine.push(newSolped.solpedDet[item].linenum);
                newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                newSolpedLine.push(newSolped.solpedDet[item].dscription);
                newSolpedLine.push(await helper.format(newSolped.solpedDet[item].reqdatedet));
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
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode)
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
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);
            */
            ////////console.log(resultInsertSolpedDet);

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped ${solpedId}`);
            res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }



    }
 
    public async cancelacionSolped(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        //Obtener array de id de solped seleccionadas
        const arraySolpedId = req.body;

        //////console.log(arraySolpedId);
        let connection = await db.getConnection();
        let errorSAP = "";
        await connection.beginTransaction();
        try {

            for (let id of arraySolpedId) {
                let infoSolped = await helper.getSolpedById(id, bdmysql);
                
                if(infoSolped.solped.approved=='A'){
                    //Anular solped en SAP
                    let infoSolpedSAP = await helper.getSolpedByIdSL(infoUsuario[0], infoSolped.solped.sapdocnum, infoSolped.solped.serie);
                    
                    if(infoSolpedSAP.value && infoSolpedSAP.value.length>0){
                        let DocEntry = infoSolpedSAP.value[0].DocEntry;
                        //////console.log(DocEntry);
                        let resultAnulacion = await helper.anularSolpedByIdSL(infoUsuario[0],DocEntry);
                        ////////console.log(resultAnulacion);
                        if(resultAnulacion.error){
                            //////console.log(resultAnulacion.error.message.value);
                            errorSAP = resultAnulacion.error.message.value;
                        }

                        if(validaPresupuesto == 'S'){
                            //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                            let Solped = await helper.getSolpedById(id,bdmysql);
                            let docEntrySP = Solped.solped.docentrySP;
                            let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                            let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                            //console.log(resultCancelSolpedPresupuesto);

                        }
                    }
                }


                let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'C', t0.status='C' where t0.id in (?)`;
                const result = await connection.query(queryUpdateSolped, [id]);

                
            }
            if(errorSAP==""){
                connection.commit();
                await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo la cancelación de las siguientes solicitudes ${arraySolpedId}`);

                res.json({ status: "ok", message: `Las solicitudes ${arraySolpedId} seeccionadas fueron canceladas.` });
            }else{
                connection.rollback();
                await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo la cancelación de las siguientes solicitudes ${arraySolpedId} pero ocurrio el siguiente error: ${errorSAP}`);

                res.json({ status: "error", message: `Ocurrio un error al cancelar la solped en SAP. error: ${errorSAP}` });
            }
           
        
        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ status: "error", message: err });
        } 
    }

    public async envioAprobacionSolped(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        let urlbk = req.protocol + '://' + req.get('host');
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        const origin = req.headers.origin;
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        //Obtener array de id de solped seleccionadas
        const arraySolpedId = req.body;
        let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
        
        //Obtener aray de modelos de autorización para la aprobacion de la solped SAP

        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
        
        ////////console.log(url2);
        let connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            
            const response2 = await fetch(url2);
            const data2 = await response2.json();
            //Covertir en array el objeto obtenido desde el ws Xengine de SAP y parsear el area y la condición del query de SAP
            let arrayModelos: any[] = [];

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

            ////////console.log(arrayModelos);
            //Recorrer el array de ids de solpeds seleccionadas para aprobación e identificar dentro del array de modelos  los posibles modelos que se pueden aplicar a cada solped
            let Solped: any;
            let modelos: any[] = [];
            let modeloid: number = 0;
            let modelosAprobacion: any[];
            let arrayResult: any[] = [];
            let errorInsertAprobacion: boolean = false;
            
            let arrayErrorPresupuesto:any[] = [];
            let docEntrySolpedPresupuesto:number =0;

            for (let id of arraySolpedId) {
                //Obtener la info de la solped segun el id
                Solped = await helper.getSolpedById(id, bdmysql);
                //filtrar los modelos segun el usuario autor y area de la solped
                modelos = arrayModelos.filter(modelo => modelo.autorusercode === Solped.solped.usersap && modelo.area === Solped.solped.u_nf_depen_solped);
                ////////console.log(modelos);

                //Recorrer los modelos filtrados para evaluar las condiciones en la solped

               

                try {

                    //Obtener permiso de validacion de presupuesto para la compañia seleccionada
                    
                    ////console.log(validaPresupuesto);
                    // Validar presupuesto de la solped 
                    if(validaPresupuesto=='S'){
                        let presupuesto = await helper.getPresupuesto(infoUsuario[0],id,bdmysql,bdPresupuesto);
                        if(presupuesto.length>0){
                            connection.rollback();
                            let message = "";
                            if(presupuesto.length>1){
                                message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                            }else{
                                message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                            }

                            return res.json([{ status: "error", message }]);
                        }


                        //Obtener datos de la solped y transformar a JSON SAP
                        let infoSolpedToSAP = await helper.loadInfoSolpedToJSONSAP(Solped);
                        ////console.log(infoSolpedToSAP);
                        //Cambiar el usuario Rquester por USERAPLICACIONES
                        infoSolpedToSAP.Requester = 'USERAPLICACIONES';
                        //cambiar la serie de la solped por la serie de la solped de la base de datos SAP de presupuesto tests: COPIA_PRESUPUESTO productivo: PRESUPUESTO
                        let seriesSolpedPresupuesto = await helper.getSeriesXE(bdPresupuesto,'1470000113');
                        
                        let serieSolpedPresupuesto = 0;
                        for(let item in seriesSolpedPresupuesto){
                            if(seriesSolpedPresupuesto[item].name=='SP'){
                                serieSolpedPresupuesto = seriesSolpedPresupuesto[item].code;
                            }
                        }
                        //infoSolpedToSAP.Series = serieSolpedPresupuesto;
                        infoSolpedToSAP.Series = 62; //temporal mientras activan el usuario de Xengine para Presupuesto
                        infoSolpedToSAP.DocType = 'I';

                        infoSolpedToSAP.BPL_IDAssignedToInvoice = 2;
                        //Cambiar los items por las cuentas contables y quitar los impuestos , cambiar la cantidad a 1 y el total de la linea colocar en precio unitario
                        for(let line in infoSolpedToSAP.DocumentLines){
                            infoSolpedToSAP.DocumentLines[line].LineVendor = '';
                            infoSolpedToSAP.DocumentLines[line].ItemCode = infoSolpedToSAP.DocumentLines[line].AccountCode;
                            infoSolpedToSAP.DocumentLines[line].TaxCode = '';
                            infoSolpedToSAP.DocumentLines[line].Price = infoSolpedToSAP.DocType=='S'?infoSolpedToSAP.DocumentLines[line].LineTotal:((infoSolpedToSAP.DocumentLines[line].Price||0)*(infoSolpedToSAP.DocumentLines[line].Quantity || 1));
                            infoSolpedToSAP.DocumentLines[line].Quantity = 1;
                            infoSolpedToSAP.DocumentLines[line].WarehouseCode = 'NITROFER';
                            infoSolpedToSAP.DocumentLines[line].AccountCode="";


                            
                        }
                        
                        //console.log(infoSolpedToSAP.DocType);
                        //TODO: Registrar solped en SAP base de datos de presupuesto.
    
                        let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                        const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuarioPresupuesto[0],infoSolpedToSAP);
                        
                        if (resultResgisterSAP.error) {
                            //console.log(resultResgisterSAP.error);
                            connection.rollback();
                            return res.json([{ status: "error", message: 'Error al registrar solped en presupuesto: '+resultResgisterSAP.error.message.value }]);
                        }else{
                            ////console.log(resultResgisterSAP);
                            //TODO: Obtener docentry o docnum para actualizar solped
                            docEntrySolpedPresupuesto=resultResgisterSAP.DocEntry;

                            let queryUpdateSopledPortal = `UPDATE ${bdmysql}.solped SET docentrySP = ${docEntrySolpedPresupuesto} WHERE id = ${id} `;
                            let resultUpdateSolpedPortal = await connection.query(queryUpdateSopledPortal);
                            
                            
                        }
                    }
                    

                    //let newAprobacion:any[] = [];
                    let newAprobacionLine: any[] = [];


                    for (let modelo of modelos) {
                        //Query que valida si la solped cumple con la condicion dada
                        let queryModelo = `SELECT (SUM(t1.linetotal)/t0.trm) AS total
                                        FROM ${bdmysql}.solped t0 
                                        INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id 
                                        WHERE t0.id = ${id}
                                        HAVING total ${modelo.condicion}`;

                        ////////console.log(queryModelo);
                        const result = await db.query(queryModelo);
                        ////////console.log(result.length);
                        //Si el resultado de la consulta es mayo a cero se toma el id del modelo valido
                        if (result.length > 0) {
                            modeloid = modelo.modeloid;
                            ////////console.log(modeloid);

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

                            ////////console.log(newAprobacionLine);

                            let existeNivel = `Select COUNT(*) AS filas from ${bdmysql}.aprobacionsolped where id_solped = ${id} and nivel = ${modelo.nivel} and estadoap='P' and estadoseccion='A'`;
                            let resultExisteNivel = await db.query(existeNivel);
                            //console.log(resultExisteNivel);
                            if(resultExisteNivel[0].filas ==0){

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
    
                                const resultInsertnewAprobacion = await connection.query(queryInsertnewAprobacion, [newAprobacionLine]);
                                ////////console.log(resultInsertnewAprobacion);
                                if (resultInsertnewAprobacion.affectedRows > 0) {
                                    arrayResult.push({ solpedid: id, status: "success" });
                                    newAprobacionLine = [];
                                    //Actualizar el estado de la solped a Pendiente
                                    let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'P' where t0.id in (?)`;
                                    const result = await connection.query(queryUpdateSolped, [id]);
                                } else {
                                    arrayResult.push({ solpedid: id, status: "error" });
                                    errorInsertAprobacion = true;
                                }
                                
                            }


                            
                            
                            //res.json({message:`Se realizo correctamnente el registro de la solped`});

                        }
                    }

                    connection.commit();

                } catch (err) {
                    // Print errors
                    //////console.log(err);
                    // Roll back the transaction
                    connection.rollback();
                    return res.json([{ status: "error", message: err }]);
                } 


            }

            if (!errorInsertAprobacion) {
                //notificacion de envio aprobación solped x cada solped seleccionada
                let solpedNotificacion:any;
                for (let idSolped of arraySolpedId) {


                    

                    //obtener remitente y siguiente destinarario de aprobación solped
                    solpedNotificacion = await helper.getSolpedById(idSolped, bdmysql);
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,infoUsuario[0].logoempresa,origin,urlbk);
                    if(LineAprovedSolped!=''){
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                        ////////console.log(aprobadorCrypt);
                        let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,infoUsuario[0].logoempresa,solpedNotificacion,aprobadorCrypt,urlbk,false,true);
                        ////////console.log(html);
                        //Obtener datos de la solped a aprobar
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                    }
                    await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} solicito la aprobación de la solped  ${idSolped}`);
                    await helper.sendNotification(infoEmail);
                    html= await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,infoUsuario[0].logoempresa,solpedNotificacion,aprobadorCrypt,urlbk,false,false);
                    infoEmail.html = html;
                    infoEmail.to = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email; //enviar copia al autor de la solped
                    await helper.sendNotification(infoEmail);

                    
                    

                    

                    }else{
                        //////console.log(`No existe modelo de aprobación para la solped ${idSolped} `);
                        return res.json([{ status: "error", message: `No existe modelo de aprobación para la solped ${idSolped} ` }]);
                    }

                }
            }

            ////////console.log((solpedObject));
            return res.json(arrayResult);
            
        }catch (error: any) {
            console.error(error);
            connection.rollback();
            return res.json(error);
        }finally {
            if (connection) await connection.release();
        }
        
    }

    public async envioAprobacionSolped2(req: Request, res: Response) {
             
        
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            let urlbk = req.protocol + '://' + req.get('host');
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
            const origin = req.headers.origin;
            const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
            //Obtener array de id de solped seleccionadas
            const arraySolpedId = req.body;
            let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);

            let arrayErrors:any[] = [];
            let arrayAproved:any[] = [];
            let error:boolean = false;
        
        try {
        
            //const modeloAprobacionesSAP:any = await helper.modeloAprobacionesSAP(infoUsuario[0]);
           /*await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} incio proceso de envio de aprobación de la/s solped ${JSON.stringify(arraySolpedId)}`);
            const modeloAprobacionesSAP:any = await helper.modeloAprobacionesMysql(infoUsuario[0]);
            
            if(modeloAprobacionesSAP.error){
                arrayErrors.push({
                    message:`Error interno: error al obtener modelos de apobación SAP`
                    
                });        
                error = true;
                await helper.logaccion(infoUsuario[0],`Error interno: error al obtener modelos de apobación SAP`);
            }*/

            if(!error){

                let Solped: any;
                let modelos: any[] = [];
                let modeloid: number = 0;
                let modelosAprobacion: any[];
                let arrayResult: any[] = [];
                let errorInsertAprobacion: boolean = false;
                
                let arrayErrorPresupuesto:any[] = [];
                let docEntrySolpedPresupuesto:number =0;
    

                for(let id of arraySolpedId){

                    
                    error=false;
                    //Recorrer el array de ids de solpeds seleccionadas para aprobación e identificar dentro del array de 
                    //modelos  los posibles modelos que se pueden aplicar a cada solped
                    //Obtener la info de la solped segun el id
                    Solped = await helper.getSolpedById(id, bdmysql);
                    //filtrar los modelos segun el usuario autor y area de la solped

                    await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} incio proceso de envio de aprobación de la/s solped ${JSON.stringify(arraySolpedId)}`);
                    let modeloAprobacionesSAP:any[] = await helper.modeloAprobacionesMysql(infoUsuario[0],Solped.solped.u_nf_depen_solped);

                    console.log(modeloAprobacionesSAP,Solped.solped.u_nf_depen_solped);
                    
                    /*if(modeloAprobacionesSAP.error){
                        arrayErrors.push({
                            message:`Error interno: error al obtener modelos de apobación SAP`
                            
                        });        
                        error = true;
                        await helper.logaccion(infoUsuario[0],`Error interno: error al obtener modelos de apobación SAP`);
                    }*/
                    
                    /*modelos = modeloAprobacionesSAP.filter((modelo: { autorusercode: any; area: any; }) => 
                                                            modelo.autorusercode === Solped.solped.usersap && 
                                                            modelo.area === Solped.solped.u_nf_depen_solped);*/

                    modelos = modeloAprobacionesSAP.filter((modelo: { autorusercode: any; area: any; }) => modelo.area === Solped.solped.u_nf_depen_solped);

                    console.log(modelos);
                    
                    if(modeloAprobacionesSAP.length ==0){
                        //console.log('validacion de modelos usuario, area');
                        await helper.logaccion(infoUsuario[0],`Solped ${id}: No existen modelos asociados al area ${Solped.solped.u_nf_depen_solped} y/o usuario ${Solped.solped.usersap}`);
                        arrayErrors.push({message:`Solped ${id}: No existen modelos asociados al area ${Solped.solped.u_nf_depen_solped} y/o usuario ${Solped.solped.usersap}`});
                        error = true;
                        
                    }

                    // Validar presupuesto de la solped 
                    if(!error){
                        
                        if(validaPresupuesto=='S'){
                            //console.log(`Valida presupuesto: ${infoUsuario[0].fullname}`);
                            let presupuesto = await helper.getPresupuesto(infoUsuario[0],id,bdmysql,bdPresupuesto);
                            if(presupuesto.length>0){
                                
                                let message = "";
                                if(presupuesto.length>1){
                                    message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                                }else{
                                    message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                                }
                                
                                arrayErrors.push({message:`Solped ${id}: ${message}`});
                                error = true;

                                await helper.logaccion(infoUsuario[0],`Solped ${id}: Error ${message}`);
                            }else{
                                //console.log("Inicio registro de solped en bd de presupuesto");
                                
                                //Obtener datos de la solped y transformar a JSON SAP
                                let infoSolpedToSAP = await helper.loadInfoSolpedToJSONSAP(Solped);
                                //Cambiar el usuario Rquester por USERAPLICACIONES
                                infoSolpedToSAP.Requester = 'USERAPLICACIONES';
                                //cambiar la serie de la solped por la serie de la solped de la base de datos SAP de presupuesto tests: COPIA_PRESUPUESTO productivo: PRESUPUESTO
                                let seriesSolpedPresupuesto = await helper.getSeriesXE(bdPresupuesto,'1470000113');
                                
                                let serieSolpedPresupuesto = 0;
                                for(let item in seriesSolpedPresupuesto){
                                    if(seriesSolpedPresupuesto[item].name=='SP'){
                                        serieSolpedPresupuesto = seriesSolpedPresupuesto[item].code;
                                    }
                                }
                                //infoSolpedToSAP.Series = serieSolpedPresupuesto;
                                infoSolpedToSAP.Series = 62; //temporal mientras activan el usuario de Xengine para Presupuesto
                                infoSolpedToSAP.DocType = 'I';

                                infoSolpedToSAP.BPL_IDAssignedToInvoice = 2;
                                //Cambiar los items por las cuentas contables y quitar los impuestos , cambiar la cantidad a 1 y el total de la linea colocar en precio unitario
                                for(let line in infoSolpedToSAP.DocumentLines){
                                    infoSolpedToSAP.DocumentLines[line].LineVendor = '';
                                    infoSolpedToSAP.DocumentLines[line].ItemCode = infoSolpedToSAP.DocumentLines[line].AccountCode;
                                    infoSolpedToSAP.DocumentLines[line].TaxCode = '';
                                    infoSolpedToSAP.DocumentLines[line].Price = infoSolpedToSAP.DocType=='S'?infoSolpedToSAP.DocumentLines[line].LineTotal:((infoSolpedToSAP.DocumentLines[line].Price||0)*(infoSolpedToSAP.DocumentLines[line].Quantity || 1));
                                    infoSolpedToSAP.DocumentLines[line].Quantity = 1;
                                    infoSolpedToSAP.DocumentLines[line].WarehouseCode = 'NITROFER';
                                    infoSolpedToSAP.DocumentLines[line].AccountCode="";
                                    infoSolpedToSAP.DocumentLines[line].ProjectCode="";

                                }
                                
                                ////console.log(infoSolpedToSAP);
                                //Registrar solped en SAP base de datos de presupuesto.
                                await helper.logaccion(infoUsuario[0],`Solped ${id}: Registro de solped en bd de presupuesto ${JSON.stringify(infoSolpedToSAP)}`);
            
                                let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                                const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuarioPresupuesto[0],infoSolpedToSAP);
                                
                                if (resultResgisterSAP.error) {
                                    await helper.logaccion(infoUsuario[0],`Solped ${id}: Error al registrar solped en presupuesto:  ${JSON.stringify(resultResgisterSAP.error.message.value).replace(/['"]+/g, '')}`);
                                    //console.log('Error registro solped: ',resultResgisterSAP.error.message.value);
                                   
                                    arrayErrors.push({message:`Solped ${id}: Error al registrar solped en presupuesto:  ${resultResgisterSAP.error.message.value}`});
                                    error = true;
                                    
                                }else{

                                    //Obtener docentry o docnum para actualizar solped
                                    docEntrySolpedPresupuesto=resultResgisterSAP.DocEntry;
                                    await helper.logaccion(infoUsuario[0],`Solped ${id}: Se registro correctamente la solped en presupuesto con el DocEntry:  ${docEntrySolpedPresupuesto}`);

                                    let queryUpdateSopledPortal = `UPDATE ${bdmysql}.solped SET docentrySP = ${docEntrySolpedPresupuesto} WHERE id = ${id} `;
                                    let resultUpdateSolpedPortal = await db.query(queryUpdateSopledPortal);
                                    //console.log("Registro de solped en bd presupuesto");
                                    await helper.logaccion(infoUsuario[0],`Solped ${id}: Se actualiza correctamente el DocEntry  ${docEntrySolpedPresupuesto} en la solped `);            
                                }
                            }
                        }
                    }
                    //Validar modelos en solped
                    if(!error){

                        let newAprobacionLine: any[] = [];
                        let arrayResultEvalModelos: any[] = [];
                        //Recorrer los modelos filtrados para evaluar las condiciones en la solped
                        for (let modelo of modelos) {
                            //Query que valida si la solped cumple con la condicion dada
                            let queryModelo = `SELECT (SUM(t1.linetotal)/t0.trm) AS total
                                            FROM ${bdmysql}.solped t0 
                                            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id 
                                            WHERE t0.id = ${id}
                                            HAVING total ${modelo.condicion}`;

                            let result = await db.query(queryModelo);
                            //console.log(result.length);
                            //Si el resultado de la consulta es mayor a cero se toma el id del modelo valido
                            
                            if (result.length > 0) {
                                
                                let existeNivel = `Select COUNT(*) AS filas from ${bdmysql}.aprobacionsolped where id_solped = ${id} and nivel = ${modelo.nivel} and estadoap='P' and estadoseccion='A'`;
                                let resultExisteNivel = await db.query(existeNivel);
                                //console.log(resultExisteNivel);
                                if(resultExisteNivel[0].filas ==0){

                                    modeloid = modelo.modeloid;
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
        
                                    const resultInsertnewAprobacion = await db.query(queryInsertnewAprobacion, [newAprobacionLine]);
                                    ////////console.log(resultInsertnewAprobacion);
                                    if (resultInsertnewAprobacion.affectedRows > 0) {
                                        arrayResultEvalModelos.push({ status: "success", message: 'ok' });
                                        await helper.logaccion(infoUsuario[0],`Solped ${id}: Se registro correctamente la linea de aprobación ${JSON.stringify(newAprobacionLine)}`);
                                        newAprobacionLine = [];
                                        //Actualizar el estado de la solped a Pendiente
                                        let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'P' where t0.id in (?)`;
                                        const result = await db.query(queryUpdateSolped, [id]);
                                        await helper.logaccion(infoUsuario[0],`Solped ${id}: Se actualizo correctamente a P el estado de aprobación de la solped`);
                                    } else {
                                        //arrayResult.push({ solpedid: id, status: "error" });
                                        //errorInsertAprobacion = true;
                                        arrayResultEvalModelos.push({ status: "error", message:`Error al registrar la linea de aprobación ${JSON.stringify(newAprobacionLine)} `})
                                        await helper.logaccion(infoUsuario[0],`Solped ${id}: Error al registrar la linea de aprobación ${JSON.stringify(newAprobacionLine)}`);
                                        //error = true;
                                    }
                                    
                                }else{
                                    //Error existe una linea de aprobación
                                    console.log("Error no existe una linea de aprobacion");
                                }

                            }
                            
                        }
                        
                        if(arrayResultEvalModelos.length>0){
                            if(arrayResultEvalModelos.filter(result => result.status === 'error').length>0){
                                let errores = arrayResultEvalModelos.filter(result => result.status === 'error').map((error)=>{return error.message});
                                arrayErrors.push({message:`Solped ${id}: ${JSON.stringify(errores)} `});
                                error = true;    
                            }
                        }else{
                            arrayErrors.push({message:`Solped ${id}: No existen modelos asociados al area ${Solped.solped.u_nf_depen_solped} y/o usuario ${Solped.solped.usersap}`});
                            error = true;
                            await helper.logaccion(infoUsuario[0],`Solped ${id}: No existen modelos asociados al area ${Solped.solped.u_nf_depen_solped} y/o usuario ${Solped.solped.usersap}`);
                        }


                    }

                    
                    //Envio de notificaciónes solped con modelos y 
                    if(!error){

                        let solpedNotificacion:any;
                        //obtener remitente y siguiente destinarario de aprobación solped
                        solpedNotificacion = await helper.getSolpedById(id, bdmysql);
                        let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(id, bdmysql,compania,infoUsuario[0].logoempresa,origin,urlbk);
                        if(LineAprovedSolped!=''){
                            let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                            let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],
                                                                                LineAprovedSolped,
                                                                                infoUsuario[0].logoempresa,
                                                                                solpedNotificacion,
                                                                                aprobadorCrypt,
                                                                                urlbk,
                                                                                false,
                                                                                true);
                            //Obtener datos de la solped a aprobar
                            let infoEmail:any = {
                                to:(urlbk.includes('localhost')==true || 
                                    urlbk.includes('-dev.')==true)?
                                    'ralbor@nitrofert.com.co':
                                    LineAprovedSolped.aprobador.email,
                                subject: `Solicitud de aprobación Solped ${id}`,
                                html
                            }
                            
                            await helper.sendNotification(infoEmail);
                            html= await helper.loadBodyMailSolpedAp(infoUsuario[0],
                                                                    LineAprovedSolped,
                                                                    infoUsuario[0].logoempresa,
                                                                    solpedNotificacion,
                                                                    aprobadorCrypt,
                                                                    urlbk,
                                                                    false,
                                                                    false);
                            infoEmail.html = html;
                            infoEmail.to = (urlbk.includes('localhost')==true || 
                                            urlbk.includes('-dev.')==true)?
                                            'ralbor@nitrofert.com.co':
                                            LineAprovedSolped.autor.email; //enviar copia al autor de la solped
                            await helper.sendNotification(infoEmail);

                            arrayAproved.push({message:`Solped ${id}: Se ha enviado correctamente a aprobación`});
                            await helper.logaccion(infoUsuario[0],`Solped ${id}: Se envia notificación de la solped a los siguientes destinatarios: ${LineAprovedSolped.aprobador.email} ${LineAprovedSolped.autor.email} `); 
                        }
                    }
                
                }
            }
        
            res.json([{arrayErrors,
                        arrayAproved,
                        status:'complete',
                        message:`El proceso de solicitud aprobacón fue realizado correctamente del cual se 
                                    ${arraySolpedId.length>1?
                                    ' han obtenido los siguientes resultados: ':
                                    arrayErrors.length>0 && arrayAproved.length >0?
                                    ' han obtenido los siguientes resultados; ':
                                    ' ha obtenido el siguiente resultado:' } `}]);

    

        }catch(err){
            console.error(err);
            res.json([{arrayErrors,
                arrayAproved,
                status:'error',
                message:`El proceso de solicitud aprobacón fue detenido debido al siguiente error: ${err} 
                         ${arrayErrors.length>0 || arrayAproved.length >0?
                         ' sin embargo ':''} 
                         ${arraySolpedId.length>1 && (arrayErrors.length>0 || arrayAproved.length >0)?
                         ' se han obtenido los siguientes resultados: ':
                         arrayErrors.length>0 && arrayAproved.length >0?
                         ' se han obtenido los siguientes resultados: ':
                         (arrayErrors.length>0 && arrayAproved.length ==0)||(arrayErrors.length==0 && arrayAproved.length >0)?
                         ' se ha obtenido el siguiente resultado: ':'' }`}]);
        }        
        
        
    }

    public async aproved_portal(req: Request, res: Response) {
        
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        const logo = infoUsuario[0].logoempresa;
        const arraySolpedId = req.body;
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        ////////console.log(arraySolpedId);
        let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
        //console.log(`Aprobación desde el portal: ${infoUsuario[0].fullname}`);
        let connection = await db.getConnection();
        let Solped:any;
        let messageSolped = "";
        let error = false;
        let arrayErrors:any[] = [];
        let arrayAproved:any[] = [];
        try {
            await connection.beginTransaction();
            //Recorrer array de id de solped a aprobar
            for (let idSolped of arraySolpedId) {

                //Obtener permiso de validacion de presupuesto para la compañia seleccionada
                
              
                 if(validaPresupuesto=='S'){
                    // Validar presupuesto de la solped 
                    //console.log(`Valida presupuesto: ${infoUsuario[0].fullname}`);
                    let presupuesto = await helper.getPresupuesto(infoUsuario[0],idSolped,bdmysql,bdPresupuesto);
                    if(presupuesto.length>0){
                        connection.rollback();
                        let message = "";
                        if(presupuesto.length>1){
                            message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                        }else{
                            message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                        }
                        //console.log(message);
                        return res.json([{ status: "error", message }]);
                    }
                 }
                 


                

                //Obtener la informacipn de la solped ppor id
                Solped = await helper.getSolpedById(idSolped,bdmysql);

                //Consulta de liena de aprobación del usaurio aprobador
                let queryLineaAprobacion = `Select * 
                                            from ${bdmysql}.aprobacionsolped t0 
                                            where t0.id_solped = ${idSolped} and 
                                                  t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                  t0.estadoseccion='A'`;
                ////////console.log(queryLineaAprobacion);
                let resultLineaAprobacion = await connection.query(queryLineaAprobacion);
               // //////console.log(resultLineaAprobacion);
                 
                //Validar el estado de la linea de aprobación
                if(resultLineaAprobacion[0].estadoap === 'P'){
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                    let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);
                    ////////console.log(resultUpdateLineAproved);
                    //Obtener información del proximo aprobador
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,req.headers.origin ,urlbk,resultLineaAprobacion[0].id);
                    ////////console.log(LineAprovedSolped);
                    if(LineAprovedSolped!=''){
                        //console.log(`Envia notificacion a prximo aprobador: ${infoUsuario[0].fullname}`);
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                        //////console.log(aprobadorCrypt);
                        
                        let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                    
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        //////console.log(messageSolped);
                        arrayAproved.push({idSolped,messageSolped,infoEmail});
                    }else{
                        //console.log(`Registro solped SAP: ${infoUsuario[0].fullname}`);
                        LineAprovedSolped =  {
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
                                companysap:compania,
                                logo,
                                origin:req.headers.origin
                            }
                        };
                        ////////console.log(LineAprovedSolped);

                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);
                        //console.log(dataForSAP);
                            //registrar Solped en SAP
                            const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
                            ////////console.log(resultResgisterSAP);

                            if (resultResgisterSAP.error) {
                                //console.log(`Error en registro solped SAP: ${infoUsuario[0].fullname} error: ${resultResgisterSAP.error.message.value} `);
                               error = true;
                                //////console.log(resultResgisterSAP.error.message.value);
                                arrayErrors.push({idSolped,messageSolped:resultResgisterSAP.error.message.value})
                            }else{
                                //////console.log(resultResgisterSAP.DocNum);
                                LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                                //////console.log(LineAprovedSolped);

                                //Actualizar solpedSAP
                                let docEntry = resultResgisterSAP.DocEntry;
                                let dataUpdateSolpedSAP = {
                                    U_AUTOR_PORTAL:Solped.solped.usersap,
                                    DocumentLines:[
                                        {
                                            U_ID_PORTAL:idSolped,
                                            U_NF_NOM_AUT_PORTAL:Solped.solped.usersap
                                        }
                                    ]
                                }
                                //////console.log(dataUpdateSolpedSAP);
                                //////console.log(JSON.stringify(dataUpdateSolpedSAP));
                                //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);

                                //Actualizar  sapdocnum, estado de aprobacion y de solped
                                let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                                let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);
                                //console.log(`Registra proces de aprobacion: ${infoUsuario[0].fullname}`);
                                //Registrar proceso de aprobacion solped en SAP
                                let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario[0],bdmysql,idSolped,resultResgisterSAP.DocNum);
                                //console.log(resultResgisterProcApSA[0].error.message.value);

                                const html:string = await helper.loadBodyMailApprovedSolped(infoUsuario[0],LineAprovedSolped,logo,Solped,'',urlbk,true);
                                
                                if(validaPresupuesto == 'S'){
                                    //console.log(`Cancela solped SAP en presupuesto: ${infoUsuario[0].fullname}`);
                                    //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                                    let docEntrySP = Solped.solped.docentrySP;
                                    if(docEntrySP!=0){
                                        let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                                        let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                        //console.log(resultCancelSolpedPresupuesto);
                                    }else{
                                        //console.log('No se encontro docentry asociado a la solped');
                                    }
                                    

                                }     
                                
                        
                                //Obtener datos de la solped a aprobar para notificación
                                //Obtenerr Emial de compradores segun la compañia, y area de la solped para colocarlos en copia del mail
                                let arrayMailsCompradoresSL = await helper.getUsuariosComprasAreaSL(infoUsuario[0],Solped.solped.u_nf_depen_solped);
                                let emailCompradores = "";
                                if(arrayMailsCompradoresSL.value.length>0){
                                    for(let item of arrayMailsCompradoresSL.value){
                                        emailCompradores+=`${item.Users.eMail},`;
                                    }
                                }
                    
                                //////console.log(emailCompradores);

                                let infoEmail:any = {
                                    to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': LineAprovedSolped.autor.email,
                                    //cc:emailCompradores+LineAprovedSolped.aprobador.email,
                                    cc: (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': emailCompradores,
                                    subject: `Aprobación Solped ${idSolped}`,
                                    html
                                }
                                //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                                await helper.sendNotification(infoEmail);
                                messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                                //////console.log(messageSolped);
                                arrayAproved.push({idSolped,messageSolped,infoEmail});

                            } 

                    }
                }else{
                    //connection.rollback();
                    error = true;
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        //////console.log(messageSolped);
                        arrayErrors.push({idSolped,messageSolped})
                        //return res.json({message:messageSolped, status:501});
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        //////console.log(messageSolped);
                        arrayErrors.push({idSolped,messageSolped})
                        //return res.json({message:messageSolped, status:501});
                    }
                }

            }

            if(error){
                connection.rollback();
            }else{
                await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo la aprobación de las solicitudes  ${arrayAproved}`);
                connection.commit();
                
            }

            res.json([{arrayErrors,arrayAproved,status:''}]);
            

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            //res.json({ err, status: 501 });
            res.json([{ status: "error", err }]);
        } finally {
            if (connection) await connection.release();
        }

        
    }

    public async aproved_portal3(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        const logo = infoUsuario[0].logoempresa;
        const arraySolpedId = req.body;
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        ////////console.log(arraySolpedId);
        let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
        //console.log(`Aprobación desde el portal: ${infoUsuario[0].fullname}`);
        await helper.logaccion(infoUsuario[0],`Inicio Aprobación desde el portal: ${infoUsuario[0].fullname} ${JSON.stringify(arraySolpedId)}`);
        
        let messageSolped = "";
        
        let arrayErrors:any[] = [];
        let arrayAproved:any[] = [];
        try {

            for (let idSolped of arraySolpedId) {

                //Obtener la informacipn de la solped ppor id
                let Solped:any = await helper.getSolpedById(idSolped,bdmysql);
                let error = false;
                //Valida presupesto
                
                if(validaPresupuesto=='S'){
                    //console.log(`Valida presupuesto: ${infoUsuario[0].fullname}`);
                    await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Valida presupuesto ${infoUsuario[0].fullname} `);
                    let presupuesto = await helper.getPresupuesto(infoUsuario[0],idSolped,bdmysql,bdPresupuesto);
                    if(presupuesto.length>0){
                        
                        let message = "";
                        if(presupuesto.length>1){
                            message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                        }else{
                            message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                        }
                        
                        arrayErrors.push({message:`Solped ${idSolped}: ${message}`});
                        error = true;
                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Error ${message} `);
                        //return res.json([{ status: "error", message }]);
                    }
                }
                

                //Validar linea de aprobación de la solped para notificar al siguiente aprobador o aporbar la solped
                if(!error){
                    //Consulta de liena de aprobación del usaurio aprobador
                    let queryLineaAprobacion = `Select * 
                                                from ${bdmysql}.aprobacionsolped t0 
                                                where t0.id_solped = ${idSolped} and 
                                                    t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                    t0.estadoseccion='A'`;
                    let resultLineaAprobacion =  await db.query(queryLineaAprobacion);
                    
                    if(resultLineaAprobacion[0].estadoap != 'P'){
                        error = true;
                        if(resultLineaAprobacion[0].estadoap === 'A'){
                            messageSolped = `La solped ya fue aprobada`;
                            arrayErrors.push({message:`Solped ${idSolped}: ${messageSolped}`})
                        }else{
                            messageSolped = `La solped ya fue rechazada`;
                            arrayErrors.push({message:`Solped ${idSolped}: ${messageSolped}`})
                        }

                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Error ${messageSolped} `);
                    }

                    if(resultLineaAprobacion[0].estadoap === 'P'){
                        
                        //Obtener información del proximo aprobador
                        let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, 
                                                                                          bdmysql,
                                                                                          compania,
                                                                                          logo,
                                                                                          req.headers.origin ,
                                                                                          urlbk,
                                                                                          resultLineaAprobacion[0].id);
                        
                        //Valida si existe una liena de aprobación, si existe envia notificación al siguiente aprobador  
                        //si no genera solped en sap, actualiza estado de solped en mysql y envia notificación de aprbación

                        if(LineAprovedSolped!=''){
                            //Envio de notificación al proximo
                            //console.log(`Envia notificacion a prximo aprobador: ${infoUsuario[0].fullname}`);
                            await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Se envia notificacion a prximo aprobador: ${infoUsuario[0].fullname} `);
                            //genera token de notificación a proximo aprobador
                            let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                            //Obtener Formato mail solped a aprobar para el siguiente aprobador
                            let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],
                                                                                LineAprovedSolped,
                                                                                logo,
                                                                                Solped,
                                                                                aprobadorCrypt,
                                                                                urlbk,
                                                                                true,
                                                                                true);
                    
                        
                            //Envio de notificación al siguiente aprobador
                            let infoEmail:any = {
                                to:(urlbk.includes('localhost')==true || 
                                    urlbk.includes('-dev.')==true)?
                                    'ralbor@nitrofert.com.co':
                                    LineAprovedSolped.aprobador.email,
                                subject: `Solicitud de aprobación Solped ${idSolped}`,
                                html
                            }
                            await helper.sendNotification(infoEmail);
                            //Obtener Formato mail solped copia al autor
                            html = await helper.loadBodyMailSolpedAp(infoUsuario[0],
                                                                     LineAprovedSolped,
                                                                     logo,
                                                                     Solped,
                                                                     aprobadorCrypt,
                                                                     urlbk,
                                                                     true,
                                                                     false);

                            //Envio de notificación copia al autor
                            infoEmail.html = html;
                            infoEmail.to = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email;
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped fue aprobada y fue notificado a siguiente aprobador del proceso ${LineAprovedSolped.aprobador.fullname}`;
                            await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  ${messageSolped} `);
                            //////console.log(messageSolped);
                            arrayAproved.push({message:`Solped ${idSolped}: ${messageSolped}`});
                        }else{
                            //Proceso para generar solpe en SAP
                            let DocNumSAP =0;
                            let DocEntrySAP =0;
                            
                            

                            if(!error){
                                //Registro de solped aprobada en SAP
                                //console.log(`Registro solped SAP: ${infoUsuario[0].fullname}`);
                                await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  Registro solped SAP: ${infoUsuario[0].fullname}`);
                                //Generar data para registro de la solped en SAP
                                let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);
                                console.log(JSON.stringify(dataForSAP));
                                //registrar Solped en SAP
                                const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
                                ////////console.log(resultResgisterSAP);
                                if (resultResgisterSAP.error) {
                                    //console.log(`Error en registro solped SAP: ${infoUsuario[0].fullname} error: ${resultResgisterSAP.error.message.value} `);
                                    await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  Error en registro solped SAP: ${infoUsuario[0].fullname} ${resultResgisterSAP.error.message.value.replace(/['"]+/g, '')}`);
                                    error = true;
                                    //////console.log(resultResgisterSAP.error.message.value);
                                    arrayErrors.push({message:`Solped ${idSolped}: Error en registro solped SAP ${resultResgisterSAP.error.message.value}`});
                                    
                                }else{
                                    DocNumSAP = resultResgisterSAP.DocNum;
                                    DocEntrySAP = resultResgisterSAP.DocEntry; 

                                    //Registra proceso de aprobación en SAP
                                    //console.log(`Registra proces de aprobacion: ${infoUsuario[0].fullname} ${DocNumSAP} ${DocEntrySAP}`);
                                    await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  Registra proceso de aprobacion: ${infoUsuario[0].fullname} ${DocNumSAP} ${DocEntrySAP}`);
                                    //Registrar proceso de aprobacion solped en SAP

                                    let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario[0],bdmysql,idSolped,resultResgisterSAP.DocNum);
                                    
                                    //console.log(resultResgisterProcApSA);
                                    if(resultResgisterProcApSA.length>0){
                                        //console.log('Error en registro proceso de aprobacion SAP',resultResgisterProcApSA);
                                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Error en registro proceso de aprobacion SAP ${JSON.stringify(resultResgisterProcApSA).replace(/['"]+/g, '')}`);
                                        error = true;
                                        arrayErrors.push({message:`Solped ${idSolped}: Error en registro proceso de aprobacion SAP ${JSON.stringify(resultResgisterProcApSA)}`})
                                        //Anular Solped de SAP por falla en registro de aprobación
                                        let cancelSolpedSAP = await helper.CancelSolpedSAP(infoUsuario[0],DocEntrySAP);
                                    }else{

                                        //asociar solped a proyecto seleccionado

                                        let proyectosSolped = await helper.ProyectosSolped(idSolped, bdmysql);

                                        console.log(proyectosSolped);
                                       
                                        if(proyectosSolped.length>0){
                                            let result= await helper.registrarProyectosSolped(infoUsuario[0],DocEntrySAP,proyectosSolped);
                                        }

                                        //Anula solped en base de datos de presupuesto
                            
                                        if(validaPresupuesto == 'S'){
                                            //console.log(`Cancela solped SAP en presupuesto: ${infoUsuario[0].fullname}`);
                                            await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  Cancela solped SAP en presupuesto: ${infoUsuario[0].fullname} `);
                                            //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                                            let docEntrySP = Solped.solped.docentrySP;
                                            if(docEntrySP!=0){
                                                let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                                                //let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                                let solpedPresupuesto = await helper.consultarSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                                //console.log(solpedPresupuesto.DocumentStatus)
                                                if(solpedPresupuesto.DocumentStatus=="bost_Open"){
                                                    let resultCancelSolpedPresupuesto = await helper.cerrarSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                                    //console.log(resultCancelSolpedPresupuesto);
                                                    if (resultCancelSolpedPresupuesto.error) {
                                                        //console.log(`Error al cancelar solped SAP Presupueso: ${infoUsuario[0].fullname} error: ${resultCancelSolpedPresupuesto.error.message.value} `);
                                                        error = true;
                                                        arrayErrors.push({message:`Solped ${idSolped}: Error al cancelar solped SAP Presupueso ${resultCancelSolpedPresupuesto.error.message.value}`})
                                                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  Error al cancelar solped SAP Presupueso ${resultCancelSolpedPresupuesto.error.message.value.replace(/['"]+/g, '')} `);
                                                    }
                                                    await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Se cancelo correctamente la solped de presupuesto`);     
                                                }
                                                                                                            
                                            }else{
                                                error = true;
                                                //console.log('No se encontro docentry asociado a la solped');
                                                arrayErrors.push({message:`Solped ${idSolped}: No se encontro DocEntry asociado a la solped de presupuesto`})
                                                await helper.logaccion(infoUsuario[0],`Solped:${idSolped}  No se encontro DocEntry asociado a la solped de presupuesto`);
                                            }
                                        }
                                        //Actualizar solped en mysql


                                        let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 
                                                                               Set t0.approved = 'A', 
                                                                                   t0.sapdocnum ='${DocNumSAP}', 
                                                                                   t0.status='C'  
                                                                               where t0.id = ?`;

                                        let resultUpdateSolpedAproved = await db.query(queryUpdateSolpedAproved,[idSolped]);
                                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Actualiza estado de solped a C y asigna el DocNum de SAP ${DocNumSAP}`);
                                        //Envia notificacion de  aprobación de solped al usuario autor y a los compradores del area
                                        //Obtenerr Emial de compradores segun la compañia, y area de la solped para colocarlos en copia del mail
                                        let arrayMailsCompradoresSL = await helper.getUsuariosComprasAreaSL(infoUsuario[0],Solped.solped.u_nf_depen_solped);
                                        let emailCompradores = "";
                                        if(!arrayMailsCompradoresSL.error){
                                            //console.log(arrayMailsCompradoresSL);
                                        
                                            if(arrayMailsCompradoresSL.value.length>0){
                                                for(let item of arrayMailsCompradoresSL.value){
                                                    emailCompradores+=`${item.Users.eMail},`;
                                                }
                                            }
                                        }
                                        
                                        //Obtener datos para envio de notificación de aprobación solped
                                        LineAprovedSolped =  {
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
                                                companysap:compania,
                                                logo,
                                                origin:req.headers.origin,
                                                sapdocnum:DocNumSAP
                                            }
                                        };
                                        const html:string = await helper.loadBodyMailApprovedSolped(infoUsuario[0],
                                                                                                    LineAprovedSolped,
                                                                                                    logo,
                                                                                                    Solped,
                                                                                                    '',
                                                                                                    urlbk,
                                                                                                    true);
                                        
                                        let infoEmail:any = {
                                            to:(urlbk.includes('localhost')==true || 
                                                urlbk.includes('-dev.')==true)?
                                                'ralbor@nitrofert.com.co': 
                                                LineAprovedSolped.autor.email,
                                            cc: (urlbk.includes('localhost')==true || 
                                                 urlbk.includes('-dev.')==true)?
                                                 'ralbor@nitrofert.com.co': 
                                                 emailCompradores,
                                            subject: `Aprobación Solped ${idSolped}`,
                                            html
                                        }
                                        //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                                        await helper.sendNotification(infoEmail);
                                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} Envio de notificacion a los siguientes destinatarios ${LineAprovedSolped.autor.email}, ${emailCompradores}`);
                                        messageSolped = `La solped fue aprobada y registrada en SAP satisfactoriamente con el numero ${DocNumSAP}`;
                                        await helper.logaccion(infoUsuario[0],`Solped:${idSolped} La solped fue aprobada y registrada en SAP satisfactoriamente con el numero ${DocNumSAP}`);
                                        //////console.log(messageSolped);
                                        arrayAproved.push({message:`Solped ${idSolped} ${messageSolped}`});
                                                                        
                            
                                    }
                                }
                            }
                            
                        }

                        if(!error){
                            //realiza el proceso de actualización de la linea de aprobacion  
                            let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                            let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);
                        }
                    }

                }
            }


            res.json([{arrayErrors,
                       arrayAproved,
                       status:'complete',
                       message:`El proceso de aprobacón fue realizado correctamente del cual se 
                                ${arraySolpedId.length>1?
                                ' han obtenido los siguientes resultados: ':
                                arrayErrors.length>0 && arrayAproved.length >0?
                                ' han obtenido los siguientes resultados; ':
                                ' ha obtenido el siguiente resultado:' } `}]);

        } catch (err) {
            //console.log(err);
            // Roll back the transaction
            //connection.rollback();
            //res.json({ err, status: 501 });
            res.json([{arrayErrors,
                       arrayAproved,
                       status:'error',
                       message:`El proceso de aprobacón fue detenido debido al siguiente error: ${err} 
                                ${arrayErrors.length>0 || arrayAproved.length >0?
                                ' sin embargo ':''} 
                                ${arraySolpedId.length>1 && (arrayErrors.length>0 || arrayAproved.length >0)?
                                ' se han obtenido los siguientes resultados: ':
                                arrayErrors.length>0 && arrayAproved.length >0?
                                ' se han obtenido los siguientes resultados: ':
                                (arrayErrors.length>0 && arrayAproved.length ==0)||(arrayErrors.length==0 && arrayAproved.length >0)?
                                ' se ha obtenido el siguiente resultado: ':'' }`}]);
        }
    }


    public async aproved_portal2(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        const logo = infoUsuario[0].logoempresa;
        const arraySolpedId = req.body;
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        ////////console.log(arraySolpedId);
        let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
        //console.log(`Aprobación desde el portal: ${infoUsuario[0].fullname}`);
        let connection = await db.getConnection();
        let Solped:any;
        let messageSolped = "";
        let error = false;
        let arrayErrors:any[] = [];
        let arrayAproved:any[] = [];
        try {
           

            for (let idSolped of arraySolpedId) {

                await connection.beginTransaction();

                //Valida presupouesto  compania solped 

                if(validaPresupuesto=='S'){
                    // Validar presupuesto de la solped 
                    //console.log(`Valida presupuesto: ${infoUsuario[0].fullname}`);
                    let presupuesto = await helper.getPresupuesto(infoUsuario[0],idSolped,bdmysql,bdPresupuesto);
                    if(presupuesto.length>0){
                        connection.rollback();
                        let message = "";
                        if(presupuesto.length>1){
                            message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                        }else{
                            message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                        }
                        //console.log(message);
                        arrayErrors.push({message:`Solped ${idSolped}: ${message}`});
                        error = true;
                        //return res.json([{ status: "error", message }]);
                    }
                }


                 //Obtener la informacipn de la solped ppor id
                Solped = await helper.getSolpedById(idSolped,bdmysql);

                //Consulta de liena de aprobación del usaurio aprobador
                let queryLineaAprobacion = `Select * 
                                            from ${bdmysql}.aprobacionsolped t0 
                                            where t0.id_solped = ${idSolped} and 
                                                  t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                  t0.estadoseccion='A'`;
                ////////console.log(queryLineaAprobacion);
                //let resultLineaAprobacion = await connection.query(queryLineaAprobacion);
                let resultLineaAprobacion =  await db.query(queryLineaAprobacion);
                // //////console.log(resultLineaAprobacion);
                if(resultLineaAprobacion[0].estadoap === 'P'){
                     //realiza el proceso de actualización de la linea de aprobacion  
                     let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                     let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);
                     ////////console.log(resultUpdateLineAproved);
                     //Obtener información del proximo aprobador
                     let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,req.headers.origin ,urlbk,resultLineaAprobacion[0].id);
                     if(LineAprovedSolped!=''){

                        //console.log(`Envia notificacion a prximo aprobador: ${infoUsuario[0].fullname}`);
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                        //////console.log(aprobadorCrypt);
                        
                        let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                    
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        //////console.log(messageSolped);
                        arrayAproved.push({message:`Solped ${idSolped}: ${messageSolped}`});

                     }else{
                        
                        //console.log(`Registro solped SAP: ${infoUsuario[0].fullname}`);
                        LineAprovedSolped =  {
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
                                companysap:compania,
                                logo,
                                origin:req.headers.origin
                            }
                        };
                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);
                        //console.log(dataForSAP);
                        //registrar Solped en SAP
                        const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
                        ////////console.log(resultResgisterSAP);
                        if (resultResgisterSAP.error) {
                            //console.log(`Error en registro solped SAP: ${infoUsuario[0].fullname} error: ${resultResgisterSAP.error.message.value} `);
                            error = true;
                            //////console.log(resultResgisterSAP.error.message.value);
                            arrayErrors.push({message:`Solped ${idSolped}: ${resultResgisterSAP.error.message.value}`})
                        }else{
                            //Actualizar solped en mysql
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);
                            
                            //console.log(`Registra proces de aprobacion: ${infoUsuario[0].fullname}`);
                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario[0],bdmysql,idSolped,resultResgisterSAP.DocNum);
                            //console.log(resultResgisterProcApSA);
                            if(resultResgisterProcApSA[0].error){
                                //console.log('Error en registro proceso de aprobacion SAP',resultResgisterProcApSA[0].error.message.value);
                                error = true;
                                arrayErrors.push({message:`Solped ${idSolped}: ${resultResgisterProcApSA[0].error.message.value}`})
                            }else{
                                
                            }

                            const html:string = await helper.loadBodyMailApprovedSolped(infoUsuario[0],LineAprovedSolped,logo,Solped,'',urlbk,true);
                            //Obtener datos de la solped a aprobar para notificación
                            //Obtenerr Emial de compradores segun la compañia, y area de la solped para colocarlos en copia del mail
                            let arrayMailsCompradoresSL = await helper.getUsuariosComprasAreaSL(infoUsuario[0],Solped.solped.u_nf_depen_solped);
                            let emailCompradores = "";
                            if(!arrayMailsCompradoresSL.error){
                                //console.log(arrayMailsCompradoresSL);
                            
                                if(arrayMailsCompradoresSL.value.length>0){
                                    for(let item of arrayMailsCompradoresSL.value){
                                        emailCompradores+=`${item.Users.eMail},`;
                                    }
                                }
                            }
                            
                
                            //////console.log(emailCompradores);

                            let infoEmail:any = {
                                to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': LineAprovedSolped.autor.email,
                                //cc:emailCompradores+LineAprovedSolped.aprobador.email,
                                cc: (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': emailCompradores,
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            }
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            //////console.log(messageSolped);
                            arrayAproved.push({message:`Solped ${idSolped} ${messageSolped}`});

                            //Anula solped en base de datos de presupuesto
                            if(validaPresupuesto == 'S'){
                                //console.log(`Cancela solped SAP en presupuesto: ${infoUsuario[0].fullname}`);
                                //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                                let docEntrySP = Solped.solped.docentrySP;
                                if(docEntrySP!=0){
                                    let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                                    let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                    //console.log(resultCancelSolpedPresupuesto);
                                }else{
                                    //console.log('No se encontro docentry asociado a la solped');
                                }
                            }
                        }

                     }

                }else{
                    //connection.rollback();
                    error = true;
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped ya fue aprobada`;
                        //arrayErrors.push({idSolped,messageSolped})
                        arrayErrors.push({message:`Solped ${idSolped}: ${messageSolped}`})
                        //return res.json({message:messageSolped, status:501});
                    }else{
                        
                        messageSolped = `La solped ya fue rechazada`;
                        //arrayErrors.push({idSolped,messageSolped})
                        arrayErrors.push({message:`Solped ${idSolped}: ${messageSolped}`})
                        //return res.json({message:messageSolped, status:501});
                    }
                }

                console

                if(error){
                    connection.rollback();
                }else{
                    await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo la aprobación de las solicitudd  ${idSolped}`);
                    connection.commit();
                }

            }

            res.json([{arrayErrors,arrayAproved,status:''}]);

        } catch (err) {
            //console.log(err);
            // Roll back the transaction
            connection.rollback();
            //res.json({ err, status: 501 });
            res.json([{ status: "error", err }]);
        } finally {
            if (connection) await connection.release();
        }
    }

   
    public async aprovedMail(req: Request, res: Response) {

        const { idcrypt } = req.params
        let connection = await db.getConnection();
        try {
            
            await connection.beginTransaction();
            
            //Validar token de aprobación
            const lineaAprobacion = await helper.validateToken(idcrypt);

            //////console.log(lineaAprobacion);

            //Obtener datos del token
            const idSolped = lineaAprobacion.infoSolped.id_solped;
            const bdmysql = lineaAprobacion.infoSolped.bdmysql;
            const compania = lineaAprobacion.infoSolped.companysap;
            
            const id = lineaAprobacion.infoSolped.idlineap;
            const logo = lineaAprobacion.infoSolped.logo;
            const origin  = lineaAprobacion.infoSolped.origin;
            let urlbk = req.protocol + '://' + req.get('host');
            let messageSolped = "";
            //Obtener datos de la solped segun id
            let Solped = await helper.getSolpedById(idSolped, bdmysql);

            const infoUsuario:InfoUsuario = {
                bdmysql,
                codusersap:Solped.solped.usersap,
                id:Solped.solped.id_user,
                companyname:'',
                dbcompanysap:compania,
                fullname:Solped.solped.fullname,
                email:'',
                id_company:0,
                logoempresa:logo,
                status:'',
                urlwssap:'',
                username:''
            }
            
            //Consulta de liena de aprobación por id de aprobacion
            let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
            let resultLineaAprobacion = await connection.query(queryLineaAprobacion,[id]);

            ////////console.log(resultLineaAprobacion);

            //Validar el estado de la linea de aprobación
            if(resultLineaAprobacion[0].estadoap === 'P'){
                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved,[id]);

                //Obtener información del proximo aprobador
                let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,origin,urlbk,resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if(LineAprovedSolped!=''){
                        
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                        let html:string = await helper.loadBodyMailSolpedAp(infoUsuario,LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(infoUsuario,LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        //////console.log(messageSolped);
                        //req.headers.origin
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }else{

                        LineAprovedSolped = lineaAprobacion;
                        //////console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);

                        

                        //registrar Solped en SAP
                        const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario,dataForSAP);
                         
                        if (resultResgisterSAP.error) {
                            //////console.log(resultResgisterSAP.error.message.value,"rollbak to do");

                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                        } else {
                            //////console.log(resultResgisterSAP.DocEntry,resultResgisterSAP.DocNum);
                            LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;

                            //Actualizar solpedSAP
                            let docEntry = resultResgisterSAP.DocEntry;
                            let dataUpdateSolpedSAP = {
                                U_AUTOR_PORTAL:Solped.solped.usersap,
                                DocumentLines:[
                                    {
                                        U_NF_NOM_AUT_PORTAL:Solped.solped.usersap,
                                        U_ID_PORTAL:idSolped
                                    }
                                ]
                            }
                            //////console.log(dataUpdateSolpedSAP);
                            //////console.log(JSON.stringify(dataUpdateSolpedSAP));
                            //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);


                            //////console.log(LineAprovedSolped);
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);

                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario,bdmysql,idSolped,resultResgisterSAP.DocNum);
                            let arrayMailsCompradoresSL = await helper.getUsuariosComprasAreaSL(infoUsuario,Solped.solped.u_nf_depen_solped);
                                let emailCompradores = "";
                                if(arrayMailsCompradoresSL.value.length>0){
                                    for(let item of arrayMailsCompradoresSL.value){
                                        emailCompradores+=`${item.Users.eMail},`;
                                    }
                                }

                            //Obtener datos de la solped a aprobar para notificación
                            const html:string = await helper.loadBodyMailApprovedSolped(infoUsuario,LineAprovedSolped,logo,Solped,'',urlbk,true);
                            let infoEmail:any = {
                                to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': LineAprovedSolped.autor.email,
                                //cc:LineAprovedSolped.aprobador.email,
                                cc:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': emailCompradores,
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            }
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            //////console.log(messageSolped);
                            connection.commit();
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                        }

                        

                    }

                
                

                
            }else{
                    connection.rollback();
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        //////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        //////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }

            

        } catch (error: any) {
            connection.rollback();
            //////console.log(error);
            if (error.name === 'TokenExpiredError') {

                let  messageSolped = `Token expiro`;
                return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                //res.status(401).json({ message: 'Token expiro ' });
                //return;
            }
            //////console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect(`${origin}/#/pages/notfound`);
            
            } finally {
                if (connection) await connection.release();
            }
    }

    public async aprovedMail2(req: Request, res: Response) {
         
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken = await helper.validateToken(jwt);
         //******************************************************* */
         const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
         const bdmysql = infoUsuario[0].bdmysql;
         const compania = infoUsuario[0].dbcompanysap;
         const logo = infoUsuario[0].logoempresa;
         const lineaAprobacion = req.body;
         let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
         //console.log(`Portal aprobaciones: ${infoUsuario[0].fullname}`);
         //////console.log(infoUsuario[0],lineaAprobacion);

         let urlbk = req.protocol + '://' + req.get('host');
         const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';

        let connection = await db.getConnection();
        
        try {
            
            await connection.beginTransaction();

            //Validar token de aprobación
            //Obtener datos del token
            const idSolped = lineaAprobacion.infoSolped.id_solped;
            
            const id = lineaAprobacion.infoSolped.idlineap;
            const origin  = lineaAprobacion.infoSolped.origin;
            const comentario = lineaAprobacion.infoSolped.comentario;
            let messageSolped = "";
            //Obtener datos de la solped segun id
            let Solped = await helper.getSolpedById(idSolped, bdmysql);
            if( validaPresupuesto=='S'){
                //console.log(`Valida presupuesto: ${infoUsuario[0].fullname}`);
                // Validar presupuesto de la solped 
                let presupuesto = await helper.getPresupuesto(infoUsuario[0],idSolped,bdmysql,bdPresupuesto);
                if(presupuesto.length>0){
                    
                    connection.rollback();
                    let message = "";
                    if(presupuesto.length>1){
                        message = `Las siguientes combinaciones de cuentas y dimensiones, ${JSON.stringify(presupuesto)}, no poseen presupuesto `;
                    }else{
                        message = `La siguiente combinación de cuenta y dimensiones, ${JSON.stringify(presupuesto)}, no posee presupuesto `;
                    }
                    //console.log(message);
                    return res.json([{ status: "error", message }]);
                }
            }else{
                //console.log(`No se valida presupuesto: ${infoUsuario[0].fullname}`);
            }
            

            
            
            //Consulta de liena de aprobación por id de aprobacion
            let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
            let resultLineaAprobacion = await connection.query(queryLineaAprobacion,[id]);

            //Validar el estado de la linea de aprobación
            if(resultLineaAprobacion[0].estadoap === 'P'){
                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped Set estadoap = 'A', comments='${comentario}', updated_at= CURRENT_TIMESTAMP where id = ${id}`;
                //////console.log(queryUpdateLineAproved);
                 let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved);
                //////console.log(resultUpdateLineAproved);

                //Obtener información del proximo aprobador
                let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,origin,urlbk,resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if(LineAprovedSolped!=''){
                        //console.log(`Envio notificacion al siguiente aprobador: ${infoUsuario[0].fullname}`);
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'24h');
                        let html:string = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.aprobador.email,
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(infoUsuario[0],LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        infoEmail.to =(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co': LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                      
                        connection.commit();
                        return res.json(messageSolped);
                    }else{
                        //console.log(`Registro de solped en SAP: ${infoUsuario[0].fullname}`);
                        LineAprovedSolped = lineaAprobacion;
                        //////console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);

                        //registrar Solped en SAP
                        const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
                         
                        if (resultResgisterSAP.error) {
                            //////console.log(resultResgisterSAP.error.message.value,"rollbak to do");
                            //console.log(`Error en registro soped SAP: ${infoUsuario[0].fullname}`);
                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                            return res.status(401).json({messageSolped:resultResgisterSAP.error.message.value})
                        } else {
                            //////console.log(resultResgisterSAP.DocEntry,resultResgisterSAP.DocNum);
                            LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;

                            //Actualizar solpedSAP
                            //console.log(`Actualiza solpe en SAP: ${infoUsuario[0].fullname}`);
                            let docEntry = resultResgisterSAP.DocEntry;
                            let dataUpdateSolpedSAP = {
                                U_AUTOR_PORTAL:Solped.solped.usersap,
                                DocumentLines:[
                                    {
                                        U_NF_NOM_AUT_PORTAL:Solped.solped.usersap,
                                        U_ID_PORTAL:idSolped
                                    }
                                ]
                            }
                                   
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);
                            //console.log(`Registra proceso de aprobacion en SAP: ${infoUsuario[0].fullname}`);
                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario[0],bdmysql,idSolped,resultResgisterSAP.DocNum);
                            let arrayMailsCompradoresSL = await helper.getUsuariosComprasAreaSL(infoUsuario[0],Solped.solped.u_nf_depen_solped);
                                let emailCompradores = "";
                                if(arrayMailsCompradoresSL.value.length>0){
                                    for(let item of arrayMailsCompradoresSL.value){
                                        emailCompradores+=`${item.Users.eMail},`;
                                    }
                                }
                                
                                if(validaPresupuesto=='S'){
                                    //console.log(`Cancela solped SAP presupuesto: ${infoUsuario[0].fullname}`);
                                    //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                                    let docEntrySP = Solped.solped.docentrySP;
                                    let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                                    let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                                    //console.log('Anular Solped Presupuesto',resultCancelSolpedPresupuesto);
                                
                                }

                            //Obtener datos de la solped a aprobar para notificación
                            const html:string = await helper.loadBodyMailApprovedSolped(infoUsuario[0],LineAprovedSolped,logo,Solped,'',urlbk,true);
                            let infoEmail:any = {
                                to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedSolped.autor.email,
                                //to: LineAprovedSolped.autor.email,
                                cc:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':emailCompradores,
                                //cc:'aballesteros@nitrofert.com.co',
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            }
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            //////console.log(messageSolped);
                            connection.commit();
                            //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                            return res.json(messageSolped);
                        }

                        

                    }

                
            }else{
                    connection.rollback();
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        //////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.status(401).json(messageSolped);
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        //////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.status(401).json(messageSolped);
                    }
                }

            

        } catch (error: any) {
            connection.rollback();
            //////console.log(error);
            let  messageSolped ="";
            if (error.name === 'TokenExpiredError') {

                 messageSolped = `Token expiro`;
                //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                return res.status(401).json(messageSolped);
                //res.status(401).json({ message: 'Token expiro ' });
                //return;
            }
            messageSolped = 'Fallo la autenticación del usuario';
            //////console.log({ message: 'Fallo la autenticación del usuario' });

            //return res.redirect(`${origin}/#/pages/notfound`);
            return res.status(401).json(messageSolped);
            
            } finally {
                if (connection) await connection.release();
            }
            
    }

    public async listAprobaciones(req: Request, res: Response) {
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;

        const { id } = req.params;

            let queryList =`SELECT * FROM ${bdmysql}.aprobacionsolped t0 WHERE t0.id_solped = ?`;
            let listAprobacionesSolped = await db.query(queryList,[id]);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} consulto el listado de aprobaciones de la solped ${id}`);
            res.json(listAprobacionesSolped);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
    

    public async reject(req: Request, res: Response) {

        const { idcrypt } = req.params
        try {
        
            //////console.log(await helper.validateToken(idcrypt));

            const lineaAprobacion = await helper.validateToken(idcrypt);
            const idSolped = lineaAprobacion.infoSolped.id_solped;
            const bdmysql = lineaAprobacion.infoSolped.bdmysql;
            const compania = lineaAprobacion.infoSolped.companysap;
            const id = lineaAprobacion.infoSolped.idlineap;
            const logo = lineaAprobacion.infoSolped.logo;
            const origin = lineaAprobacion.infoSolped.origin;
            
            let messageSolped = "";

            let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
            let resultLineaAprobacion = await db.query(queryLineaAprobacion,[id]);


            //////console.log(resultLineaAprobacion);

            if(resultLineaAprobacion[0].estadoap === 'P'){
                
                /*
                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'R' where t0.id = ?`;
                let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[id]);

                //Actualiza el estado de la seccion de aprobacion 
                let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped set t0.estadoseccion ='I' where t0.id_solped = ? and  t0.estadoseccion='A'`;
                let resultUpdateSeccionAproved = await db.query(queryUpdateSeccionAproved,[idSolped]);

                //Envia notificación de rechazo */

                res.redirect(`${origin}/#/reject/solped/${idcrypt}`);


            }else{
                if(resultLineaAprobacion[0].estadoap === 'A'){
                    
                    messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        //////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                }else{
                    messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        //////console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    
                }
            }


        } catch (error: any) {
            //////console.log(error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expiro ' });
                return;
            }
            //////console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect(`${origin}/#/pages/notfound`);
            
        }
    }

    public async rejectMail(req: Request, res: Response) {

         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken = await helper.validateToken(jwt);
         //******************************************************* */
         const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
         const bdmysql = infoUsuario[0].bdmysql;
         const compania = infoUsuario[0].dbcompanysap;
         const logo = infoUsuario[0].logoempresa;
         const lineaAprobacion = req.body;
         let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);
         //////console.log(infoUsuario[0],lineaAprobacion);

         let urlbk = req.protocol + '://' + req.get('host');

         //console.log(urlbk);
         const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        
        try {
        
            ////////console.log(await helper.validateToken(idcrypt));

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
            let resultLineaAprobacion = await db.query(queryLineaAprobacion,[id]);


            //////console.log(resultLineaAprobacion);

            if(resultLineaAprobacion[0].estadoap === 'P'){
                
                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped Set estadoap = 'R', comments='${comentario}', updated_at= CURRENT_TIMESTAMP where id = ?`;
                let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[id]);

                //Actualiza el estado de la seccion de aprobacion 
                let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped set estadoseccion ='I', updated_at= CURRENT_TIMESTAMP where id_solped = ? and  estadoseccion='A'`;
                let resultUpdateSeccionAproved = await db.query(queryUpdateSeccionAproved,[idSolped]);

                //Actualiza el estado de la dolped a rechazado 
                let queryUpdateSolpedRechazado = `Update ${bdmysql}.solped set approved ='R'  where id = ? `;
                let resultUpdateSolpedRechazado = await db.query(queryUpdateSolpedRechazado,[idSolped]);
                
                if(validaPresupuesto =='S'){
                    //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                    let Solped = await helper.getSolpedById(idSolped,bdmysql);
                    let docEntrySP = Solped.solped.docentrySP;
                    let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                    let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                    //console.log(resultCancelSolpedPresupuesto);
                }
                

                //Envia notificación de rechazo                
                
                messageSolped = `La solped  ${idSolped} fue rechazada`;
                //console.log(messageSolped);
                //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);

                let Solped:any = await helper.getSolpedById(idSolped,bdmysql);
                const html:string = await helper.loadBodyMailRejectSolped(lineaAprobacion,logo,Solped);
                

                let infoEmail:any = {
                to:(urlbk.includes('localhost')==true || 
                urlbk.includes('-dev.')==true)?
                'ralbor@nitrofert.com.co': 
                //'ralbor@nitrofert.com.co',
                lineaAprobacion.autor.email,
                subject: `Notificacion de rechazo Solped ${idSolped}`,
                html
                }
                //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                await helper.sendNotification(infoEmail);

                return res.json(messageSolped);

            }else{
                if(resultLineaAprobacion[0].estadoap === 'A'){
                    
                    messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        //////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.json(messageSolped);
                }else{
                    messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        //////console.log(messageSolped);
                        //return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                        return res.json(messageSolped);
                }
            }


        } catch (error: any) {
            //////console.log(error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ messageSolped: 'Token expiro ' });
                return;
            }
            //////console.log({ message: 'Fallo la autenticación del usuario' });

            //return res.redirect(`${origin}/#/pages/notfound`);
            res.status(401).json({ messageSolped: 'Fallo la autenticación del usuario' });
            
        }
        
    }

    public async rejectSolped(req: Request, res: Response){
        
        let connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            const lineaAprobacion = req.body;

            //////console.log(lineaAprobacion);

            const idSolped = lineaAprobacion.infoSolped.id_solped;
            const bdmysql = lineaAprobacion.infoSolped.bdmysql;
            const compania = lineaAprobacion.infoSolped.companysap;
            const id = lineaAprobacion.infoSolped.idlineap;
            const logo = lineaAprobacion.infoSolped.logo;
            const comments = lineaAprobacion.infoSolped.comments;
            let validaPresupuesto = await helper.permisoValidacionPresupuesto(compania);

            let urlbk = req.protocol + '://' + req.get('host');

            //console.log(urlbk);
            const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';

            let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
            let resultLineaAprobacion = await db.query(queryLineaAprobacion,[id]);

            if(resultLineaAprobacion[0].estadoap !== 'R'){

                 //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'R', comments='${comments}'  where t0.id = ?`;
                let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[id]);

                //Actualiza el estado de la seccion de aprobacion 
                let queryUpdateSeccionAproved = `Update ${bdmysql}.aprobacionsolped t0 set t0.estadoseccion ='I',  t0.updated_at= CURRENT_TIMESTAMP where t0.id_solped = ? and  t0.estadoseccion='A'`;
                let resultUpdateSeccionAproved = await db.query(queryUpdateSeccionAproved,[idSolped]);

                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateRejecSolped = `Update ${bdmysql}.solped t0 Set t0.approved = 'R'  where t0.id = ?`;
                let resultUpdateRejecSolped = await db.query(queryUpdateRejecSolped,[idSolped]);

                if(validaPresupuesto =='S'){
                    //Cancelar solped en base de datos de Presupuesto SAP con el docentrySP obenido de la solped
                    let Solped = await helper.getSolpedById(idSolped,bdmysql);
                    let docEntrySP = Solped.solped.docentrySP;
                    let infoUsuarioPresupuesto:any = [{dbcompanysap:bdPresupuesto}]
                    let resultCancelSolpedPresupuesto = await helper.anularSolpedByIdSL(infoUsuarioPresupuesto[0],docEntrySP);
                    //console.log(resultCancelSolpedPresupuesto);
                }

                //Envia notificación de rechazo
                let Solped = await helper.getSolpedById(idSolped, bdmysql);
                
                const html:string = await helper.loadBodyMailRejectSolped(lineaAprobacion,logo,Solped);
                ////////console.log(html);
                //Obtener datos de la solped a aprobar
                
                let infoEmail:any = {
                    to:(urlbk.includes('localhost')==true || 
                    urlbk.includes('-dev.')==true)?
                    'ralbor@nitrofert.com.co': 
                    //'ralbor@nitrofert.com.co',
                    lineaAprobacion.autor.email,
                    subject: `Notificacion de rechazo Solped ${idSolped}`,
                    html
                }
                ////////console.log(infoEmail);
                await helper.sendNotification(infoEmail);
                connection.commit();
                res.json([{ status: "ok", message: `La solicitud de pedido # ${idSolped} fue rechazada` }]);

            }else{
                //////console.log("error rject ya fue rechazada");
                connection.rollback();
                res.json([{ status: "error", message: `La solicitud # ${idSolped} ya fue rechazada` }]);
            }
            
           

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json([{ status: "error", message: err }]);
        } finally {
            if (connection) await connection.release();
        }
        
    }

    public async uploadAnexoSolped(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const infoFile = req.body;
        

        try {

            //////console.log(infoFile);
            //////console.log(req.file);

            let archivo = fs.readFileSync(req.file!.path);

            //////console.log(archivo);
                        
            let anexo = {
                id_solped:infoFile.solpedID,
                tipo: infoFile.anexotipo,
                nombre:req.file?.originalname ,
                size:req.file?.size,
                ruta:req.file?.path,
                encoding:req.file?.encoding,
                mimetype:req.file?.mimetype,
                archivo
            }

            //console.log(anexo);

            let sqlInsertFileSolped = `Insert into ${bdmysql}.anexos set ?`;
            let resultInsertFileSolped = await db.query(sqlInsertFileSolped, [anexo]);
            
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} cargo el archivo ${req.file?.originalname} asociado a la solped ${infoFile.solpedID}`);
            res.json({message:`El archio ${req.file?.originalname} fue cargado satisfactoriamente`, ruta:req.file?.path, idanexo:resultInsertFileSolped.insertId });


        } catch (err) {
            // Print errors
            //console.log(err);
            // Roll back the transaction
            res.json({ err, status: 501 });
        } 





    }

    public async borrarAnexoSolped(req: Request, res: Response): Promise<void> {
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken = await helper.validateToken(jwt);
         //******************************************************* */
         const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
         const bdmysql = infoUsuario[0].bdmysql;
         const infoFile = req.body;
         
         let connection = await db.getConnection();

        
        try {

            //////console.log(infoFile);

            let pathFile = path.resolve(infoFile.ruta.toString());
            
            

            let queryDeleteAnexoSolped = `Delete from ${bdmysql}.anexos where id= ${infoFile.idanexo}`;

            //////console.log(queryDeleteAnexoSolped);

            let resultDeleteAnexo =  await connection.query(queryDeleteAnexoSolped, [infoFile.idanexo]);
            if(fs.existsSync(pathFile)){
                //////console.log(pathFile);
                fs.unlinkSync(pathFile);
            }
            

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} elimino el archivo ${infoFile.name} asociado a la solped ${infoFile.idsolped}`);
            res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}`});




        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }
    }

    public async downloadAnexoSolped(req: Request, res: Response): Promise<void> {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const infoFile = req.body;
        
      
       
       try {

           //////console.log(infoFile);

           let pathFile = path.resolve(infoFile.ruta.toString());
           
           
            //////console.log(__dirname);
         
          
           if(fs.existsSync(pathFile)){
               //////console.log(pathFile);
               //fs.unlinkSync(pathFile);
               res.download (pathFile);

               /*let road = fs.createReadStream (pathFile); // Crear entrada de flujo de entrada
                res.writeHead(200, {
                    'Content-Type': 'application/force-download',
                    'Content-Disposition': 'attachment; filename=name'
                });
                
                road.pipe (res);*/

           }
           

         

           //res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}`});




       } catch (err) {
           // Print errors
           //////console.log(err);
           // Roll back the transaction
           
           res.json({ err, status: 501 });
       } 
   }

    public async listMP(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bieSession = await helper.loginWsSAP(infoUsuario[0]);

            if(bieSession!=''){
                const configWs2 = {
                    method:"GET", 
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''   
                    }    
                }
        
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq 189`;
        
                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();
        
                ////////console.log(data2.value);
        
                helper.logoutWsSAP(bieSession); 
                
               return res.json(data2.value);
            }

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listMPS(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            let status = req.params.status;
            let serie =0;
            let seriesDoc = await helper.getSeriesXE(infoUsuario[0].dbcompanysap,'1470000113');
            for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='SPMP'){
                    serie = seriesDoc[item].code;
                }
            }
            
            

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.serie='${serie}' `;
            }else{
                where = ` WHERE  t0.serie='${serie}' `;
            }

            let solped_open_sap = await helper.getSolpedMPopenSL(infoUsuario[0],serie);
           

            let array_solped_sap:any[] =[0];
            for(let solped of solped_open_sap.value){
                ////////console.log(solped.DocNum);
                array_solped_sap.push(solped.DocNum);
            }

           // //////console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));

            if(where==''){
                where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }else{
                where = where+ ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
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

            ////////console.log(queryList);

            const solped = await db.query(queryList);
            //////console.log(solped);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
            res.json(solped);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listMPS2(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            let status = req.params.status;

            let serie =0;
            let seriesDoc = await helper.getSeriesXE(infoUsuario[0].dbcompanysap,'1470000113');
            for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='SPMP'){
                    serie = seriesDoc[item].code;
                }
            }

            

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.serie='${serie}' and t0.sapdocnum =0 and t0.approved='N'`;
            }else{
                where = ` WHERE  t0.serie='${serie}' and t0.sapdocnum=0 and t0.approved='N'`;
            }

            
            ////////console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));

            /*if(where==''){
                where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }else{
                where = where+ ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }*/
            let proveedores = await helper.objectToArray(await helper.getProveedoresXE(infoUsuario[0]));

            let solped_open_sap = await helper.getAllSolpedMPopenSL(infoUsuario[0],serie);
            
            let array_solped_sap = await helper.covertirResultadoSLArray(solped_open_sap);


            
            ////////console.log(solped_open_sap);

            

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
            t0.nf_pedmp as "U_NF_PEDMP",
            t0.id as "U_ID_PORTAL"
              FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            ${where}
           
            ORDER BY t0.id DESC`;

            ////////console.log(queryList);

            

            const solpeds = await db.query(queryList);
            for(let solped of solpeds) {
                if(solped.CardCode!=''){
                    solped.CardName = proveedores.filter((data: { CardCode: any; }) =>data.CardCode === solped.CardCode)[0].CardName;
                    solped.ProveedorDS = `${solped.CardCode} - ${solped.CardName}`;
                }
            }
            let solicitudesSAP:any[] = [];
            ////////console.log(solped);
            for(let linea of array_solped_sap){
                if(linea.CardCode!=''){
                    linea.CardName = proveedores.filter((data: { CardCode: any; }) => data.CardCode === linea.CardCode)[0].CardName;
                    linea.ProveedorDS = `${linea.CardCode} - ${linea.CardName}`;
                }
                solicitudesSAP.push({
                    id: linea.U_ID_PORTAL==''?linea.DocEntry:linea.U_ID_PORTAL,
                    approved: linea.approved,
                    DocNum: linea.DocNum,
                    key: linea.key,
                    U_NF_STATUS: linea.U_NF_STATUS,
                    LineNum: linea.lineNum,
                    ItemCode: linea.ItemCode,
                    ItemDescription: linea.ItemDescription,
                    Description:`${linea.ItemCode} - ${linea.ItemDescription}`,
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
                    RemainingOpenQuantity:linea.RemainingOpenQuantity,
                    U_NF_PEDMP:linea.U_NF_PEDMP,
                    CardName:linea.CardName!=''?proveedores.filter((data: { CardCode: any; }) => data.CardCode === linea.CardCode)[0].CardName:'',
                    ProveedorDS:linea.ProveedorDS,
                    U_ID_PORTAL:linea.U_ID_PORTAL

                });
            }

            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
            let proyeccionesSolicitudes = {
                proyecciones:solpeds,
                solicitudesSAP

            } 

            ////////console.log(proyeccionesSolicitudes);

            res.json(proyeccionesSolicitudes);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listMPS3(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            let status = req.params.status;

            let serie =0;
            //let seriesDoc = await db.query(`Select * from ${bdmysql}.series where objtype ='1470000113'`);
            let seriesDoc = await db.query(`Select * from ${bdmysql}.series where name ='SPMP'`);
            ////console.log(seriesDoc[0].code);
            serie = seriesDoc[0].code;            
            /*for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='SPMP'){
                    serie = seriesDoc[item].code;
                }
            }*/

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE  t2.name='SPMP' and t0.sapdocnum =0 and t0.approved='N'`;
            }else{
                where = ` WHERE  t2.name='SPMP' and t0.sapdocnum=0 and t0.approved='N'`;
            }

            
            ////////console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));

            /*if(where==''){
                where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }else{
                where = where+ ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }*/
            //let proveedores = await helper.objectToArray(await helper.getProveedoresXE(infoUsuario[0]));

            let proveedores = await db.query(`Select * from ${bdmysql}.socios_negocio`);
            //Solped en SAP
            let solped_open_sap = await helper.getAllSolpedMPopenSL(infoUsuario[0],serie);
            let array_solped_sap = await helper.covertirResultadoSLArray(solped_open_sap);


            
           // //console.log(array_solped_sap[0]);

            

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
            t4.WhsName AS "WarehouseName",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.comments AS "Comments",
            t1.unidad AS "MeasureUnit",
            t1.linevendor as "CardCode",
            t3.CardName AS "CardName",
            concat(t3.CardCode,' ',t3.CardName) AS "ProveedorDS",
            t0.nf_pedmp as "U_NF_PEDMP",
            t0.id as "U_ID_PORTAL"
            FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            INNER JOIN ${bdmysql}.series t2 ON t2.code = t0.serie
            INNER JOIN ${bdmysql}.almacenes t4 ON t4.WhsCode_Code = t1.whscode
            LEFT JOIN ${bdmysql}.socios_negocio t3 ON t3.CardCode = t1.linevendor 
            ${where}
           
            ORDER BY t0.id DESC`;

            ////////console.log(queryList);

            

            const solpeds = await db.query(queryList);
            let solicitudesSAP:any[] = [];
            ////////console.log(solped);
            for(let linea of array_solped_sap){

                if(linea.CardCode!=''){
                    linea.CardName = proveedores.filter((data: { CardCode: any; }) => data.CardCode === linea.CardCode)[0].CardName;
                    linea.ProveedorDS = `${linea.CardCode} - ${linea.CardName}`;
                }
                solicitudesSAP.push({
                    id: linea.U_ID_PORTAL==''?linea.DocEntry:linea.U_ID_PORTAL,
                    approved: linea.approved,
                    DocNum: linea.DocNum,
                    key: linea.key,
                    U_NF_STATUS: linea.U_NF_STATUS,
                    LineNum: linea.lineNum,
                    ItemCode: linea.ItemCode,
                    ItemDescription: linea.ItemDescription,
                    Description:`${linea.ItemCode} - ${linea.ItemDescription}`,
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
                    RemainingOpenQuantity:linea.RemainingOpenQuantity,
                    U_NF_PEDMP:linea.U_NF_PEDMP,
                    CardName:linea.CardName!=''?proveedores.filter((data: { CardCode: any; }) => data.CardCode === linea.CardCode)[0].CardName:'',
                    ProveedorDS:linea.ProveedorDS,
                    U_ID_PORTAL:linea.U_ID_PORTAL

                });
            }

            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
            let proyeccionesSolicitudes = {
                proyecciones:solpeds,
                solicitudesSAP

            } 

            ////////console.log(proyeccionesSolicitudes);

            res.json(proyeccionesSolicitudes);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listMPS4(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE  t2.name='SPMP'  and t0.approved='N'`;
            }else{
                where = ` WHERE  t2.name='SPMP'  and t0.approved='N'`;
            }

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
            t4.WhsName AS "WarehouseName",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.comments AS "Comments",
            t1.unidad AS "MeasureUnit",
            t1.linevendor as "CardCode",
            t3.CardName AS "CardName",
            concat(t3.CardCode,' ',t3.CardName) AS "ProveedorDS",
            t0.nf_pedmp as "U_NF_PEDMP",
            t0.id as "U_ID_PORTAL"
            FROM ${bdmysql}.solped t0
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            INNER JOIN ${bdmysql}.series t2 ON t2.code = t0.serie
            INNER JOIN ${bdmysql}.almacenes t4 ON t4.WhsCode_Code = t1.whscode
            LEFT JOIN ${bdmysql}.socios_negocio t3 ON t3.CardCode = t1.linevendor 
            ${where}
           
            ORDER BY t0.id DESC`;

            ////////console.log(queryList);

            const proyecciones = await db.query(queryList);

            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
           let proyeccionesSolicitudes = {
                proyecciones
            }

            ////////console.log(proyeccionesSolicitudes);

            res.json(proyeccionesSolicitudes);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async documentsTracking(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
           
            
            const docsTracking = await helper.objectToArray(await helper.documentsTracking(compania));

            ////console.log(docsTracking);

            res.json(docsTracking);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async createMP(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        const newSolped = req.body;
       ////////console.log(newSolped);
        let connection = await db.getConnection();

        try {

            

            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.solped set ?`;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);

            if(newSolped.solped.nf_lastshippping){
                newSolped.solped.nf_lastshippping = await helper.format(newSolped.solped.nf_lastshippping);
            }

            if(newSolped.solped.nf_dateofshipping){
                newSolped.solped.nf_dateofshipping = await helper.format(newSolped.solped.nf_dateofshipping);
            }
            
           
            //console.log(querySolped);
            let resultInsertSolped = await connection.query(querySolped, [newSolped.solped]);
            //console.log(resultInsertSolped);

            let solpedId = resultInsertSolped.insertId;
            let newSolpedDet:any[] = [];
            let newSolpedLine:any[] = [];
            for (let item in newSolped.solpedDet) {

                
                newSolpedLine.push(solpedId);
                newSolpedLine.push(newSolped.solpedDet[item].linenum);
                newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                newSolpedLine.push(newSolped.solpedDet[item].dscription);
                newSolpedLine.push(await helper.format(newSolped.solpedDet[item].reqdatedet));
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
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode)
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                newSolpedLine.push(newSolped.solpedDet[item].whscode);
                newSolpedLine.push(newSolped.solpedDet[item].id_user);
                newSolpedLine.push(newSolped.solpedDet[item].unidad);
                newSolpedLine.push(newSolped.solpedDet[item].zonacode);
                newSolpedDet.push(newSolpedLine);
                newSolpedLine = [];
            }

            //////console.log(newSolpedDet);
            let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                    acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user,unidad,zonacode) values ?
            `;

            //console.log(queryInsertDetSolped);
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            //console.log(resultInsertSolpedDet);

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente el registro de la solped de materia prima No. ${solpedId}`);
            res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}`,solpednum:solpedId });

        } catch (err) {
            // Print errors
            //console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }





    }

    public async updateMP(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        

        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let solpedId = newSolped.solped.id;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);
            newSolped.solped.nf_lastshippping = await helper.format(newSolped.solped.nf_lastshippping);
            newSolped.solped.nf_dateofshipping = await helper.format(newSolped.solped.nf_dateofshipping);
            ////////console.log('Encabezado',newSolped.solped);
            //Actualizar encabezado solped 
            let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
            let resultUpdateSolped = await connection.query(querySolped, [newSolped.solped, solpedId]);
            ////////console.log(resultUpdateSolped);

            //Borrar detalle Solped seleccionada
            querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
            let resultDeleteSolpedDet = await connection.query(querySolped, [solpedId]);
            ////////console.log(resultDeleteSolpedDet);


            let newSolpedDet:any[] = [];
            let newSolpedLine:any[] = [];
            for (let item in newSolped.solpedDet) {
                newSolpedLine.push(solpedId);
                newSolpedLine.push(newSolped.solpedDet[item].linenum);
                newSolpedLine.push(newSolped.solpedDet[item].itemcode);
                newSolpedLine.push(newSolped.solpedDet[item].dscription);
                newSolpedLine.push(await helper.format(newSolped.solpedDet[item].reqdatedet));
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
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode)
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode2);
                newSolpedLine.push(newSolped.solpedDet[item].ocrcode3);
                newSolpedLine.push(newSolped.solpedDet[item].whscode);
                newSolpedLine.push(newSolped.solpedDet[item].id_user);
                newSolpedLine.push(newSolped.solpedDet[item].unidad);
                newSolpedLine.push(newSolped.solpedDet[item].zonacode);
                newSolpedDet.push(newSolpedLine);
                newSolpedLine = [];
            }

            //////console.log('Detalle',newSolpedDet);
            let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user,unidad,zonacode) values ?
           `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            ////////console.log(resultInsertSolpedDet);

            //Si la solped ya fue enviada a SAP, actualizar la info en SAP



            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped de materia prima No. ${solpedId}`);
            res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }



    }

    public async updateCantidadMP(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        ////////console.log(newSolped);

        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            
            let { idProyeccion, cantidadProyectada , item, fechaEditar, linenum } = newSolped;

            //let querySolped = `Update ${bdmysql}.solped_det set quantity = ${cantidadProyectada}  where id_solped = ? and itemcode = ?`;
            let querySolped  = `UPDATE  ${bdmysql}.solped_det t1 
              INNER JOIN ${bdmysql}.solped t0 ON t0.id = t1.id_solped 
              SET t1.quantity =${cantidadProyectada}, t0.reqdate = '${await helper.format(fechaEditar)}' 
              WHERE t0.id =? AND t1.itemcode = ? AND t1.linenum = ?`;
            let resultUpdateSolped = await connection.query(querySolped, [idProyeccion,item,linenum]);
            ////////console.log(resultUpdateSolped);

            

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped de materia prima No. ${idProyeccion}`);
            res.json({ message: `Se realizo correctamnente la actualización de la solped ${idProyeccion}` });

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }



    }

    public async enviarSolpedSAP(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const { id }= req.body;
        //////console.log(req.body);
        

        try {
            
            let infoSolped = await helper.getSolpedById(id,bdmysql);
            let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(infoSolped);

            //registrar Solped en SAP
            const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
            ////////console.log(resultResgisterSAP);

            if (resultResgisterSAP.error) {
               
                 //////console.log(resultResgisterSAP.error.message.value);
                 res.json({ err:resultResgisterSAP.error.message.value, status: 501 });
             }else{
                 //Actualizar  sapdocnum, estado de aprobacion y de solped
                 let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C', t0.u_nf_status='Solicitado'  where t0.id = ?`;
                 let resultUpdateSolpedAproved = await db.query(queryUpdateSolpedAproved,[id]);
                 
                 await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} envio la solped ${id} a SAP y se registro correctamente con el No. ${resultResgisterSAP.DocNum}`);
                 let messageSolped = `La solped ${id} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;

                 res.json({message:messageSolped});
             }

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            
            res.json({ err, status: 501 });
        } 





    }

    public async enviarSolpedSAP2(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const { solpedsId }= req.body;
        //////console.log(req.body);
        

        try {
            let error = false;
            let arrayErrors:any[] = [];
            let arrayApproved:any[] = [];

            for(let id of solpedsId){
                

                let infoSolped = await helper.getSolpedById(id,bdmysql);

                if(infoSolped.solped.approved === 'A'){
                    arrayErrors.push({message: `Solped ${id}: la solped seleccionada ya fue envia a SAP`});
                }else if (infoSolped.solped.approved === 'C'){
                    arrayErrors.push({message: `Solped ${id}: la solped seleccionada esta cancelada`});
                }else{

                    let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(infoSolped);

                    console.log(dataForSAP);

                    //registrar Solped en SAP
                    const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);

                    if (resultResgisterSAP.error) {
                
                        //console.log(resultResgisterSAP.error.message.value);
                        //res.json({ err:resultResgisterSAP.error.message.value, status: 501 });
                        arrayErrors.push({message: `Error Solped ${id}: Ocurrio un error al registrar la sopled en SAP ${resultResgisterSAP.error.message.value}`});

                    }else{
                        //Actualizar  sapdocnum, estado de aprobacion y de solped
                        let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C', t0.u_nf_status='Solicitado'  where t0.id = ?`;
                        let resultUpdateSolpedAproved = await db.query(queryUpdateSolpedAproved,[id]);
                        
                        await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} envio la solped ${id} a SAP y se registro correctamente con el No. ${resultResgisterSAP.DocNum}`);
                        let messageSolped = `La solped ${id} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                        arrayApproved.push({ message: messageSolped})
                        //res.json({message:messageSolped});
                    }

                }  

                
            }
            
            

            
            ////////console.log(resultResgisterSAP);

            res.json({arrayErrors, arrayApproved });

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            
            
            res.json({ err, status: 501 });
        } 





    }
    
    
    public async actualizarSolpedSAP(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const infoSolped= req.body;
        ////////console.log(req.body);
        
        let id = infoSolped.solped.id;
        let serie = infoSolped.solped.serie;
        let DocNum = infoSolped.solped.sapdocnum;

        try {
            
            let infoSolped = await helper.getSolpedById(id,bdmysql);
            let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(infoSolped);
            //console.log(DocNum,serie);
            //Obtener DocEntry de la solpred desde sap
            let idSolped = await helper.getSolpedByIdSL(infoUsuario[0],DocNum,serie);

            let DocEntry = idSolped.value[0].DocEntry;

            
            //console.log(DocEntry,JSON.stringify(dataForSAP));
            //actualizar Solped en SAP

            let resultUpdateSolped = await helper.updateSolpedSAP(infoUsuario[0],dataForSAP,DocEntry);
            //console.log(resultUpdateSolped);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} actualizao correctamente la solped ${DocNum} en SAP`);
            res.json({message:'Se realizo la actualizacon de la solped en SAP'});

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            
            res.json({ err, status: 501 });
        } 





    }

    public async listOCMP(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);

            let status = req.params.status;

            let listadoOCMP = await helper.getOcMPByStatusSL( infoUsuario[0],status);

            res.json(listadoOCMP);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async actualizarPedidoSAP(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const infoPedido= req.body;
        //console.log(JSON.stringify(req.body));
        
        let DocEntry = infoPedido.DocEntry;
        let Datapedido = infoPedido.pedidoData;
        let DocNum = infoPedido.DocNum;

        try {
            
     

            //actualizar Pedido en SAP

            let resultUpdatePedido = await helper.updatePedidoSAP(infoUsuario[0],Datapedido,DocEntry);
            //console.log(resultUpdatePedido);
            if(resultUpdatePedido==""){
                await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} actualizao correctamente el pedido ${DocNum} en SAP`);
                res.json({message:`Se realizo la actualizacon del pedido ${DocNum} en SAP`,error:false});
            }else{
                console.log(resultUpdatePedido);
                await helper.logaccion(infoUsuario[0],`Ocurrio un error al actualizar el pedido ${DocNum} en SAP: ${resultUpdatePedido.error.message.value}`);
                res.json({message:`Ocurrio un error al actualizar el pedido ${DocNum} en SAP: ${resultUpdatePedido.error.message.value}`,error:true});
                //res.status(400).json({message:`Ocurrio un error al actualizar el pedido ${DocNum} en SAP: ${resultUpdatePedido.error.message.value}`,error:true});

            }
            

        } catch (err) {
            // Print errors
            //////console.log(err);
            // Roll back the transaction
            
            res.json({ err, status: 501 });
        } 





    }

    public async listInMP(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);

            //let status = req.params.status;
            
            //let listadoOCMP = await helper.getEntradasMPSL( infoUsuario[0]);
            let listadoOCMP = await helper.getEntradasMPXE( infoUsuario[0]);
            ////////console.log('Entradas',listadoOCMP);

            res.json(listadoOCMP);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async getProyectos(req: Request, res: Response) {
        try {

            
            
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            
            //console.log('getProyectos');
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql; 
            const compania = infoUsuario[0].dbcompanysap;


            //let status = req.params.status;
            
            //let listadoOCMP = await helper.getEntradasMPSL( infoUsuario[0]);
            let proyectos = await helper.objectToArray(await helper.getProyectosXE(compania)) ;
            ////////console.log('Entradas',listadoOCMP);

            res.json(proyectos);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
     //Deprecated Methods

     public async listadoSolpeds_old(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);

            ////////console.log(await helper.loginWsSAP(infoUsuario[0]));
            
            

            let serie = await helper.getCodigoSerie(infoUsuario[0].dbcompanysap,'1470000113','SPMP');

            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.id_user=${infoUsuario[0].id} and t0.serie!='${serie}'`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                where = ` WHERE t0.serie!='${serie}' and 
                                t0.approved !='A'`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
               
                where =` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and 
                               t0.serie!='${serie}' and 
                               t0.approved !='A'`;
            }

           
        

            ////////console.log(decodedToken);
            let queryList = `SELECT t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t0.serieName as serieStr,
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

           ////////console.log(queryList);
           await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);

            const solped = await db.query(queryList);
            ////////console.log(solped);
            res.json(solped);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }


   
}

const solpedController = new SolpedController();
export default solpedController; 