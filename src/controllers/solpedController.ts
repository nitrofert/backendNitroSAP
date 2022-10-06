import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";


class SolpedController {

    public async list(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);

        //******************************************************* */

        

        try {
        
            const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            const perfilesUsuario: PerfilesUsuario[] = decodedToken.perfilesUsuario;
            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.id_user=${infoUsuario.id} `;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
                /*where = ` WHERE '${infoUsuario.codusersap}' = (CASE
                                    WHEN t0.approved = 'P' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='P' ORDER BY t2.nivel ASC LIMIT 1)
                                    WHEN t0.approved = 'R' THEN (SELECT t2.usersapaprobador FROM ${bdmysql}.aprobacionsolped t2 WHERE t2.id_solped = t0.id AND t2.estadoap ='R' ORDER BY t2.nivel ASC LIMIT 1)
                                    ELSE ""
                                END) `;*/

                where =` WHERE t0.id in (SELECT tt0.id_solped FROM ${bdmysql}.aprobacionsolped tt0 WHERE tt0.usersapaprobador = '${infoUsuario.codusersap}') `;
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

            //console.log(queryList);

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
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
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
            res.json({ message: `Se realizo correctamnente el registro de la solped ${solpedId}` });

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

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql

        const { id } = req.params;

        

        try {
        
            let solpedObject = await helper.getSolpedById(id, bdmysql);

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
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
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
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
        const compania = infoUsuario.dbcompanysap;
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
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
        const compania = infoUsuario.dbcompanysap;
        //Obtener array de id de solped seleccionadas
        const arraySolpedId = req.body;

        console.log(arraySolpedId);


        //Obtener aray de modelos de autorización para la aprobacion de la solped SAP

        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
        //console.log(url2);
        let connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            
            const response2 = await fetch(url2);
            //console.log(response2.body); 
            const data2 = await response2.json();
            //console.log(data2);
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
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,infoUsuario.logoempresa);
                    if(LineAprovedSolped!=''){
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        console.log(aprobadorCrypt);
                        const html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,infoUsuario.logoempresa,solpedNotificacion,aprobadorCrypt);
                        //console.log(html);
                        //Obtener datos de la solped a aprobar
                        
                        let infoEmail:any = {
                            to: LineAprovedSolped.aprobador.email,
                            cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                    }

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
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
        const arraySolpedId = req.body;
        const compania = infoUsuario.dbcompanysap;
        const logo = infoUsuario.logoempresa;

        console.log(arraySolpedId);

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
                                                  t0.usersapaprobador ='${infoUsuario.codusersap}' and 
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
                    let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo, resultLineaAprobacion[0].id);
                    console.log(LineAprovedSolped);
                    if(LineAprovedSolped!=''){
                        
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        console.log(aprobadorCrypt);
                        
                        const html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,true);
                    
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            to: LineAprovedSolped.aprobador.email,
                            cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
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
                                logo
                            }
                        };
                        console.log(LineAprovedSolped);

                        //Generar data para registro de la solped en SAP
                        let dataForSAP:PurchaseRequestsInterface = await helper.loadInfoSolpedToJSONSAP(Solped);

                            //registrar Solped en SAP
                            const resultResgisterSAP = await helper.registerSolpedSAP(infoUsuario,dataForSAP);

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
                                let resultResgisterProcApSA = await  helper.registerProcApSolpedSAP(infoUsuario,bdmysql,idSolped,resultResgisterSAP.DocNum);

                                const html:string = await helper.loadBodyMailApprovedSolped(LineAprovedSolped,logo,Solped,'',true);
                        
                                //Obtener datos de la solped a aprobar para notificación
                                
                                let infoEmail:any = {
                                    to: LineAprovedSolped.autor.email,
                                    cc:LineAprovedSolped.aprobador.email,
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

            //Obtener datos del token
            const idSolped = lineaAprobacion.infoSolped.id_solped;
            const bdmysql = lineaAprobacion.infoSolped.bdmysql;
            const compania = lineaAprobacion.infoSolped.companysap;
            const id = lineaAprobacion.infoSolped.idlineap;
            const logo = lineaAprobacion.infoSolped.logo;
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
                let LineAprovedSolped:any = await helper.getNextLineAprovedSolped(idSolped, bdmysql,compania,logo,resultLineaAprobacion[0].id);
                    //verifica si existe otra linea de aprobación si existe envia notificacion al siguiente aprobador si no envia la solped a SAP
                    if(LineAprovedSolped!=''){
                        
                        let aprobadorCrypt = await helper.generateToken(LineAprovedSolped,'240h');
                        const html:string = await helper.loadBodyMailSolpedAp(LineAprovedSolped,logo,Solped,aprobadorCrypt,true);
                        //Obtener datos de la solped a aprobar para notificación
                        
                        let infoEmail:any = {
                            to: LineAprovedSolped.aprobador.email,
                            cc:LineAprovedSolped.autor.email,
                            subject: `Solicitud de aprobación Solped ${idSolped}`,
                            html
                        }
                        //Envio de notificación al siguiente aprobador con copia al autor
                        await helper.sendNotification(infoEmail);
                        messageSolped = `La solped ${idSolped} fue aprobada y fue notificado a siguiente aprobador del proceso`;
                        console.log(messageSolped);
                        return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
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
                            return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${resultResgisterSAP.error.message.value}`);
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
                            const html:string = await helper.loadBodyMailApprovedSolped(LineAprovedSolped,logo,Solped,'',true);
                            let infoEmail:any = {
                                to: LineAprovedSolped.autor.email,
                                cc:LineAprovedSolped.aprobador.email,
                                subject: `Aprobación Solped ${idSolped}`,
                                html
                            }
                            //Envio de notificación dfe aprobacion al autor aprobador con copia al aprobador
                            await helper.sendNotification(infoEmail);
                            messageSolped = `La solped ${idSolped} fue aprobada y registrada en SAP satisfactoriamente con el numero ${resultResgisterSAP.DocNum}`;
                            console.log(messageSolped);
                            connection.commit();
                            return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                            //return JSON.parse(resultResgisterSAP.DocNum);
                        }

                        

                    }

                
                

                
            }else{
                    connection.rollback();
                    if(resultLineaAprobacion[0].estadoap === 'A'){
                        
                        messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        console.log(messageSolped);
                        return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }else{
                        
                        messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    }
                }

            

        } catch (error: any) {
            connection.rollback();
            console.log(error);
            if (error.name === 'TokenExpiredError') {

                let  messageSolped = `Token expiro`;
                return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                //res.status(401).json({ message: 'Token expiro ' });
                //return;
            }
            console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect("http://localhost:4200/#/pages/notfound");
            
        } finally {
            if (connection) await connection.release();
        }
    }

    public async listAprobaciones(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken: DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario: InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql

        const { id } = req.params;

        

        try {

            let queryList =`SELECT * FROM ${bdmysql}.aprobacionsolped t0 WHERE t0.id_solped = ?`;
        
            let listAprobacionesSolped = await db.query(queryList,[id]);

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

                res.redirect(`http://localhost:4200/#/reject/solped/${idcrypt}`);


            }else{
                if(resultLineaAprobacion[0].estadoap === 'A'){
                    
                    messageSolped = `La solped  ${idSolped} ya fue aprobada`;
                        console.log(messageSolped);
                        return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                }else{
                    messageSolped = `La solped  ${idSolped} ya fue rechazada`;
                        console.log(messageSolped);
                        return res.redirect(`http://localhost:4200/#/mensaje/solped/${idcrypt}/${messageSolped}`);
                    
                }
            }


        } catch (error: any) {
            console.log(error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expiro ' });
                return;
            }
            console.log({ message: 'Fallo la autenticación del usuario' });

            return res.redirect("http://localhost:4200/#/pages/notfound");
            
        }
    }

    async rejectSolped(req: Request, res: Response){
        
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
                    cc:lineaAprobacion.aprobador.email,
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


}

const solpedController = new SolpedController();
export default solpedController; 