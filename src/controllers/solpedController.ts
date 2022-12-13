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

  

    public async list(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);

            //console.log(await helper.loginWsSAP(infoUsuario[0]));

            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.id_user=${infoUsuario[0].id} and t0.serie!='189'`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length > 0) {
                where = ` WHERE t0.serie!='189'`;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
               
                where =` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and t0.serie!='189'`;
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
           await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} ingreso al modulo de solped`);

            const solped = await db.query(queryList);
            //console.log(solped);
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
        //console.log(newSolped.solped);
        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.solped set ?`;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);

            let resultInsertSolped = await connection.query(querySolped, [newSolped.solped]);
            //console.log(resultInsertSolped);

            let solpedId = resultInsertSolped.insertId;
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

            //console.log(newSolpedDet);
            let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            //console.log(resultInsertSolpedDet);
            
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

    public async update(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const newSolped = req.body;
        console.log(newSolped);

        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let solpedId = newSolped.solped.id;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);
            //Actualizar encabezado solped 
            let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
            let resultUpdateSolped = await connection.query(querySolped, [newSolped.solped, solpedId]);
            //console.log(resultUpdateSolped);

            //Borrar detalle Solped seleccionada
            querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
            let resultDeleteSolpedDet = await connection.query(querySolped, [solpedId]);
            //console.log(resultDeleteSolpedDet);


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

            console.log(newSolpedDet);
            let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            //console.log(resultInsertSolpedDet);

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped ${solpedId}`);
            res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });

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
 
    public async cancelacionSolped(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
        //Obtener array de id de solped seleccionadas
        const arraySolpedId = req.body;

        console.log(arraySolpedId);
        let connection = await db.getConnection();
        await connection.beginTransaction();
        try {

            for (let id of arraySolpedId) {
                let queryUpdateSolped = `UPDATE ${bdmysql}.solped t0 set t0.approved = 'C', t0.status='C' where t0.id in (?)`;
                const result = await connection.query(queryUpdateSolped, [id]);
            }

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo la cancelación de las siguientes solicitudes ${arraySolpedId}`);

            res.json({ status: "ok", message: `Las solicitudes ${arraySolpedId} seeccionadas fueron canceladas.` });
        
        } catch (err) {
            // Print errors
            console.log(err);
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
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
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
        let connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            
            const response2 = await fetch(url2);
            //console.log(response2.body); 
            const data2 = await response2.json();
            console.log(data2);
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

            //console.log(arrayModelos);
            //Recorrer el array de ids de solpeds seleccionadas para aprobación e identificar dentro del array de modelos  los posibles modelos que se pueden aplicar a cada solped
            let Solped: any;
            let modelos: any[] = [];
            let modeloid: number = 0;
            let modelosAprobacion: any[];
            let arrayResult: any[] = [];
            let errorInsertAprobacion: boolean = false;

            

            for (let id of arraySolpedId) {
                //Obtener la info de la solped segun el id
                Solped = await helper.getSolpedById(id, bdmysql);
                //filtrar los modelos segun el usuario autor y area de la solped
                modelos = arrayModelos.filter(modelo => modelo.autorusercode === Solped.solped.usersap && modelo.area === Solped.solped.u_nf_depen_solped);
                console.log(modelos);

                //Recorrer los modelos filtrados para evaluar las condiciones en la solped

               

                try {
                   

                    //let newAprobacion:any[] = [];
                    let newAprobacionLine: any[] = [];


                    for (let modelo of modelos) {
                        //Query que valida si la solped cumple con la condicion dada
                        let queryModelo = `SELECT (SUM(t1.linetotal)/t0.trm) AS total
                                        FROM ${bdmysql}.solped t0 
                                        INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id 
                                        WHERE t0.id = ${id}
                                        HAVING total ${modelo.condicion}`;

                        console.log(queryModelo);
                        const result = await db.query(queryModelo);
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

                            const resultInsertnewAprobacion = await connection.query(queryInsertnewAprobacion, [newAprobacionLine]);
                            console.log(resultInsertnewAprobacion);
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
                            
                            //res.json({message:`Se realizo correctamnente el registro de la solped`});

                        }
                    }

                    connection.commit();

                } catch (err) {
                    // Print errors
                    console.log(err);
                    // Roll back the transaction
                    connection.rollback();
                    res.json([{ status: "error", message: err }]);
                } 


            }

            if (!errorInsertAprobacion) {
                //notificacion de envio aprobación solped x cada solped seleccionada
                let solpedNotificacion:any;
                for (let idSolped of arraySolpedId) {

                    //obtener remitente y siguiente destinarario de aprobación solped
                    solpedNotificacion = await helper.getSolpedById(idSolped, bdmysql);
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,infoUsuario[0].logoempresa,origin);
                    if(LineAprovedSolped!=''){
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        console.log(aprobadorCrypt);
                        let html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,infoUsuario[0].logoempresa,solpedNotificacion,aprobadorCrypt,urlbk,false,true);
                        //console.log(html);
                        //Obtener datos de la solped a aprobar
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:'ralbor@nitrofert.com.co',
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                    }
                    await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} solicito la aprobación de la solped  ${idSolped}`);
                    await helper.sendNotification(infoEmail);
                    html= await helper.loadBodyMailSolpedAp(LineAprovedSolped,infoUsuario[0].logoempresa,solpedNotificacion,aprobadorCrypt,urlbk,false,false);
                    infoEmail.html = html;
                   //infoEmail.to = LineAprovedSolped.autor.email; //enviar copia al autor de la solped
                    await helper.sendNotification(infoEmail);


                    }else{
                        console.log(`No existe modelo de aprobación para la solped ${idSolped} `);
                    }

                }
            }

            //console.log((solpedObject));
            res.json(arrayResult);
            
        }catch (error: any) {
            console.error(error);
            connection.rollback();
            return res.json(error);
        }finally {
            if (connection) await connection.release();
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
        //console.log(arraySolpedId);

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

                //Obtener la informacipn de la solped ppor id
                Solped = await helper.getSolpedById(idSolped,bdmysql);

                //Consulta de liena de aprobación del usaurio aprobador
                let queryLineaAprobacion = `Select * 
                                            from ${bdmysql}.aprobacionsolped t0 
                                            where t0.id_solped = ${idSolped} and 
                                                  t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                  t0.estadoseccion='A'`;
                console.log(queryLineaAprobacion);
                let resultLineaAprobacion = await connection.query(queryLineaAprobacion);
                console.log(resultLineaAprobacion);

                //Validar el estado de la linea de aprobación
                if(resultLineaAprobacion[0].estadoap === 'P'){
                    //realiza el proceso de actualización de la linea de aprobacion  
                    let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                    let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);
                    //console.log(resultUpdateLineAproved);
                    //Obtener información del proximo aprobador
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,req.headers.origin ,resultLineaAprobacion[0].id);
                    console.log(LineAprovedSolped);
                    if(LineAprovedSolped!=''){
                        
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        console.log(aprobadorCrypt);
                        
                        let html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                    
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:'ralbor@nitrofert.com.co',
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        //infoEmail.to = LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        console.log(messageSolped);
                        arrayAproved.push({idSolped,messageSolped,infoEmail});
                    }else{
                        
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
                        console.log(LineAprovedSolped);

                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);

                            //registrar Solped en SAP
                            const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
                            console.log(resultResgisterSAP);

                            if (resultResgisterSAP.error) {
                               error = true;
                                console.log(resultResgisterSAP.error.message.value);
                                arrayErrors.push({idSolped,messageSolped:resultResgisterSAP.error.message.value})
                            }else{
                                console.log(resultResgisterSAP.DocNum);
                                LineAprovedSolped.infoSolped.sapdocnum = resultResgisterSAP.DocNum;
                                console.log(LineAprovedSolped);

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
                                console.log(dataUpdateSolpedSAP);
                                console.log(JSON.stringify(dataUpdateSolpedSAP));
                                //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);

                                //Actualizar  sapdocnum, estado de aprobacion y de solped
                                let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                                let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);

                                //Registrar proceso de aprobacion solped en SAP
                                let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario[0],bdmysql,idSolped,resultResgisterSAP.DocNum);

                                const html:string = await helper.loadBodyMailApprovedSolped(LineAprovedSolped,logo,Solped,'',urlbk,true);
                        
                                //Obtener datos de la solped a aprobar para notificación
                                
                                let infoEmail:any = {
                                    to: LineAprovedSolped.autor.email,
                                    //cc:LineAprovedSolped.aprobador.email,
                                    cc:'aballesteros@nitrofert.com.co',
                                    subject: `Aprobación Solped ${idSolped}`,
                                    html
                                }
                                //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                                await helper.sendNotification(infoEmail);
                                messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                                console.log(messageSolped);
                                arrayAproved.push({idSolped,messageSolped,infoEmail});

                            } 

                    }
                }else{
                    //connection.rollback();
                    error = true;
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        console.log(messageSolped);
                        arrayErrors.push({idSolped,messageSolped})
                        //return res.json({message:messageSolped, status:501});
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
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

            res.json({arrayErrors,arrayAproved});
            

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


    public async aprovedMail(req: Request, res: Response) {

        const { idcrypt } = req.params
        let connection = await db.getConnection();
        try {
            
            await connection.beginTransaction();

            



            //Validar token de aprobación
            const lineaAprobacion = await helper.validateToken(idcrypt);

            console.log(lineaAprobacion);

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
            
            //Consulta de liena de aprobación por id de aprobacion
            let queryLineaAprobacion = `Select * from ${lineaAprobacion.infoSolped.bdmysql}.aprobacionsolped t0 where t0.id = ?`;
            let resultLineaAprobacion = await connection.query(queryLineaAprobacion,[id]);

            //console.log(resultLineaAprobacion);

            //Validar el estado de la linea de aprobación
            if(resultLineaAprobacion[0].estadoap === 'P'){
                //realiza el proceso de actualización de la linea de aprobacion  
                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionsolped t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                let resultUpdateLineAproved = await connection.query(queryUpdateLineAproved,[id]);

                //Obtener información del proximo aprobador
                let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,origin,resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if(LineAprovedSolped!=''){
                        
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        let html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,true);
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            //to: LineAprovedSolped.aprobador.email,
                            to:'ralbor@nitrofert.com.co',
                            //cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        html = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,urlbk,true,false);
                        infoEmail.html = html;
                        //infoEmail.to = LineAprovedSolped.autor.email;
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        console.log(messageSolped);
                        //req.headers.origin
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }else{

                        LineAprovedSolped = lineaAprobacion;
                        console.log(LineAprovedSolped);
                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);

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

                        //registrar Solped en SAP
                        const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario,dataForSAP);
                         
                        if (resultResgisterSAP.error) {
                            console.log(resultResgisterSAP.error.message.value,"rollbak to do");

                            connection.rollback();
                            //return res.json(resultResgisterSAP.error.message.value);
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
                        } else {
                            console.log(resultResgisterSAP.DocEntry,resultResgisterSAP.DocNum);
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
                            console.log(dataUpdateSolpedSAP);
                            console.log(JSON.stringify(dataUpdateSolpedSAP));
                            //let resultUpdateSopledSAP = await helper.updateSolpedSAP(infoUsuario,dataUpdateSolpedSAP,docEntry);


                            console.log(LineAprovedSolped);
                            //Actualizar  sapdocnum, estado de aprobacion y de solped
                            let queryUpdateSolpedAproved = `Update ${bdmysql}.solped t0 Set t0.approved = 'A', t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.status='C'  where t0.id = ?`;
                            let resultUpdateSolpedAproved = await connection.query(queryUpdateSolpedAproved,[idSolped]);

                            //Registrar proceso de aprobacion solped en SAP
                            let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario,bdmysql,idSolped,resultResgisterSAP.DocNum);

                            //Obtener datos de la solped a aprobar para notificación
                            const html:string = await helper.loadBodyMailApprovedSolped(LineAprovedSolped,logo,Solped,'',urlbk,true);
                            let infoEmail:any = {
                                to: LineAprovedSolped.autor.email,
                                //cc:LineAprovedSolped.aprobador.email,
                                cc:'aballesteros@nitrofert.com.co',
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            }
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            console.log(messageSolped);
                            connection.commit();
                            return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                        }

                        

                    }

                
                

                
            }else{
                    connection.rollback();
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }

            

        } catch (error: any) {
            connection.rollback();
            console.log(error);
            if (error.name === 'TokenExpiredError') {

                let  messageSolped = `Token expiro`;
                return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                //res.status(401).json({ message: 'Token expiro ' });
                //return;
            }
            console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect(`${origin}/#/pages/notfound`);
            
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
        
            console.log(await helper.validateToken(idcrypt));

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


            console.log(resultLineaAprobacion);

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
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                }else{
                    messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`${origin}/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    
                }
            }


        } catch (error: any) {
            console.log(error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expiro ' });
                return;
            }
            console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect(`${origin}/#/pages/notfound`);
            
        }
    }

    public async rejectSolped(req: Request, res: Response){
        
        let connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            const lineaAprobacion = req.body;

            console.log(lineaAprobacion);

            const idSolped = lineaAprobacion.infoSolped.id_solped;
            const bdmysql = lineaAprobacion.infoSolped.bdmysql;
            const compania = lineaAprobacion.infoSolped.companysap;
            const id = lineaAprobacion.infoSolped.idlineap;
            const logo = lineaAprobacion.infoSolped.logo;
            const comments = lineaAprobacion.infoSolped.comments;

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

                //Envia notificación de rechazo
                let Solped = await helper.getSolpedById(idSolped, bdmysql);
                
                const html:string = await helper.loadBodyMailRejectSolped(lineaAprobacion,logo,Solped);
                //console.log(html);
                //Obtener datos de la solped a aprobar
                
                let infoEmail:any = {
                    to: lineaAprobacion.autor.email,
                    //cc:lineaAprobacion.aprobador.email,
                    cc:'aballesteros@',
                    subject: `Notificacion de rechazo Solped ${idSolped}`,
                    html
                }
                //console.log(infoEmail);
                await helper.sendNotification(infoEmail);
                connection.commit();
                res.json([{ status: "ok", message: `La solicitud de pedido # ${idSolped} fue rechazada` }]);

            }else{
                console.log("error rject ya fue rechazada");
                connection.rollback();
                res.json([{ status: "error", message: `La solicitud # ${idSolped} ya fue rechazada` }]);
            }
            
           

        } catch (err) {
            // Print errors
            console.log(err);
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

            console.log(infoFile);
            console.log(req.file);
            
            let anexo = {
                id_solped:infoFile.solpedID,
                tipo: infoFile.anexotipo,
                nombre:req.file?.originalname ,
                size:req.file?.size,
                ruta:req.file?.path
            }

            let sqlInsertFileSolped = `Insert into ${bdmysql}.anexos set ?`;
            let resultInsertFileSolped = await db.query(sqlInsertFileSolped, [anexo]);
            
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} cargo el archivo ${req.file?.originalname} asociado a la solped ${infoFile.solpedID}`);
            res.json({message:`El archio ${req.file?.originalname} fue cargado satisfactoriamente`, ruta:req.file?.path, idanexo:resultInsertFileSolped.insertId });


        } catch (err) {
            // Print errors
            console.log(err);
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

            console.log(infoFile);

            let pathFile = path.resolve(infoFile.ruta.toString());
            
            

            let queryDeleteAnexoSolped = `Delete from ${bdmysql}.anexos where id= ${infoFile.idanexo}`;

            console.log(queryDeleteAnexoSolped);

            let resultDeleteAnexo =  await connection.query(queryDeleteAnexoSolped, [infoFile.idanexo]);
            if(fs.existsSync(pathFile)){
                console.log(pathFile);
                fs.unlinkSync(pathFile);
            }
            

            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} elimino el archivo ${infoFile.name} asociado a la solped ${infoFile.idsolped}`);
            res.json({ message: `El anexo ${infoFile.name} fue elimiinado y desasociado de la solped ${infoFile.idsolped}`});




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

           console.log(infoFile);

           let pathFile = path.resolve(infoFile.ruta.toString());
           
           
            console.log(__dirname);
         
          
           if(fs.existsSync(pathFile)){
               console.log(pathFile);
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
           console.log(err);
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
        
                //console.log(data2.value);
        
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
                //console.log(solped.DocNum);
                array_solped_sap.push(solped.DocNum);
            }

           // console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));

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

            //console.log(queryList);

            const solped = await db.query(queryList);
            console.log(solped);
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
                where = ` WHERE t0.serie='${serie}' and t0.sapdocnum =0 `;
            }else{
                where = ` WHERE  t0.serie='${serie}' and t0.sapdocnum=0 `;
            }

            
            //console.log(JSON.stringify(array_solped_sap).replace('[','(').replace(']',')'));

            /*if(where==''){
                where = ` WHERE  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }else{
                where = where+ ` and  t0.sapdocnum in ${JSON.stringify(array_solped_sap).replace('[','(').replace(']',')')} `;
            }*/


            let solped_open_sap = await helper.getAllSolpedMPopenSL(infoUsuario[0],serie);
            
            let array_solped_sap = await helper.covertirResultadoSLArray(solped_open_sap);
            //console.log(solped_open_sap);

            

            let queryList = `SELECT 
            t0.id, 
            t0.approved, 
            t0.sapdocnum AS "DocNum",
            CONCAT(t0.id,'-',t0.sapdocnum,'-',t1.linenum) AS "key",
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

            //console.log(queryList);

            

            const solped = await db.query(queryList);
            console.log(solped);
            for(let linea of array_solped_sap){
                solped.push({
                    id: linea.id,
                    approved: linea.approved,
                    DocNum: linea.DocNum,
                    key: linea.key,
                    U_NF_STATUS: linea.U_NF_STATUS,
                    LineNum: linea.lineNum,
                    ItemCode: linea.ItemCode,
                    ItemDescription: linea.ItemDescription,
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
                    CarCode: linea.CardCode,
                    RemainingOpenQuantity:linea.RemainingOpenQuantity
                });
            }

            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} accidio al modulo de tracking de materia prima`);
            res.json(solped);     

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
        const newSolped = req.body;
       //console.log(newSolped);
        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.solped set ?`;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);
            newSolped.solped.nf_lastshippping = await helper.format(newSolped.solped.nf_lastshippping);
            newSolped.solped.nf_dateofshipping = await helper.format(newSolped.solped.nf_dateofshipping);

            let resultInsertSolped = await connection.query(querySolped, [newSolped.solped]);
            //console.log(resultInsertSolped);

            let solpedId = resultInsertSolped.insertId;
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
                newSolpedLine.push(newSolped.solpedDet[item].unidad);
                newSolpedLine.push(newSolped.solpedDet[item].zonacode);
                newSolpedDet.push(newSolpedLine);
                newSolpedLine = [];
            }

            console.log(newSolpedDet);
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
            console.log(err);
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
            //console.log('Encabezado',newSolped.solped);
            //Actualizar encabezado solped 
            let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
            let resultUpdateSolped = await connection.query(querySolped, [newSolped.solped, solpedId]);
            //console.log(resultUpdateSolped);

            //Borrar detalle Solped seleccionada
            querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
            let resultDeleteSolpedDet = await connection.query(querySolped, [solpedId]);
            //console.log(resultDeleteSolpedDet);


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

            console.log('Detalle',newSolpedDet);
            let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newSolpedDet]);

            //console.log(resultInsertSolpedDet);

            //Si la solped ya fue enviada a SAP, actualizar la info en SAP



            connection.commit();
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} realizo correctamnente la actualización de la solped de materia prima No. ${solpedId}`);
            res.json({ message: `Se realizo correctamnente la actualización de la solped ${solpedId}` });

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

    public async enviarSolpedSAP(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const { id }= req.body;
        console.log(req.body);
        

        try {
            
            let infoSolped = await helper.getSolpedById(id,bdmysql);
            let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(infoSolped);

            //registrar Solped en SAP
            const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario[0],dataForSAP);
            //console.log(resultResgisterSAP);

            if (resultResgisterSAP.error) {
               
                 console.log(resultResgisterSAP.error.message.value);
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
            console.log(err);
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
        //console.log(req.body);
        
        let id = infoSolped.solped.id;
        let serie = infoSolped.solped.serie;
        let DocNum = infoSolped.solped.sapdocnum;

        try {
            
            let infoSolped = await helper.getSolpedById(id,bdmysql);
            let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(infoSolped);

            //Obtener DocEntry de la solpred desde sap
            let idSolped = await helper.getSolpedByIdSL(infoUsuario[0],DocNum,serie);

            let DocEntry = idSolped.value[0].DocEntry;

            

            //actualizar Solped en SAP

            let resultUpdateSolped = await helper.updateSolpedSAP(infoUsuario[0],dataForSAP,DocEntry);
            //console.log(resultUpdateSolped);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} actualizao correctamente la solped ${DocNum} en SAP`);
            res.json({message:'Se realizo la actualizacon de la solped en SAP'});

        } catch (err) {
            // Print errors
            console.log(err);
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
        //console.log(req.body);
        
        let DocEntry = infoPedido.DocEntry;
        let Datapedido = infoPedido.pedidoData;
        let DocNum = infoPedido.DocNum;

        try {
            
     

            //actualizar Pedido en SAP

            let resultUpdatePedido = await helper.updatePedidoSAP(infoUsuario[0],Datapedido,DocEntry);
            //console.log(resultUpdateSolped);
            await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} actualizao correctamente el pedido ${DocNum} en SAP`);
            res.json({message:`Se realizo la actualizacon del pedido ${DocNum} en SAP`});

        } catch (err) {
            // Print errors
            console.log(err);
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
            //console.log('Entradas',listadoOCMP);

            res.json(listadoOCMP);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

}

const solpedController = new SolpedController();
export default solpedController; 