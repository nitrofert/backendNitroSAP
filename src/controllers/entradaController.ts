import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";


class EntradaController {

    public async list(req: Request, res: Response) {
        try {
            
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //******************************************************* */
            
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario: PerfilesUsuario[] =  await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                where = ` WHERE t0.id_user=${infoUsuario[0].id} `;
            }

        

            ////console.log(decodedToken);
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

            ////console.log(queryList);

            const entrada = await db.query(queryList);
            ////console.log(entrada);
            res.json(entrada);     

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
        const bdmysql = infoUsuario[0].bdmysql
        const newEntrada = req.body;
        //console.log(newEntrada);
        let connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.entrada set ?`;
            newEntrada.entrada.docdate = await helper.format(newEntrada.entrada.docdate);
            newEntrada.entrada.docduedate = await helper.format(newEntrada.entrada.docduedate);
            newEntrada.entrada.taxdate = await helper.format(newEntrada.entrada.taxdate);
            newEntrada.entrada.reqdate = await helper.format(newEntrada.entrada.reqdate);

            let resultInsertEntrada = await connection.query(querySolped, [newEntrada.entrada]);
            ////console.log(resultInsertSolped);

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
                newEntradaLine.push(newEntrada.EntradaDet[item].ocrcode)
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
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped, [newEntradaDet]);

            //console.log(resultInsertSolpedDet);

            if(resultInsertSolpedDet.affectedRows){
                //Registrar entrada en SAP
                let dataForSAP:any = await helper.loadInfoEntradaToJSONSAP(newEntrada);
                //console.log(dataForSAP);
                //registrar Entrada en SAP
                const resultResgisterSAP = await helper.registerEntradaSAP(infoUsuario[0],dataForSAP);

                if (resultResgisterSAP.error) {
                    //console.log(resultResgisterSAP.error.message.value);
                    connection.rollback();
                    res.json({status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId} ${resultResgisterSAP.error.message.value}` });
                }else{

                    //console.log(resultResgisterSAP.DocNum);
                    //Actualizar  sapdocnum, entrada
                    let queryUpdateEntrada = `Update ${bdmysql}.entrada t0 Set t0.sapdocnum ='${resultResgisterSAP.DocNum}'  where t0.id = ?`;
                    let resultUpdateEntrada = await connection.query(queryUpdateEntrada,[entradaId]);

                    //console.log(resultUpdateEntrada);

                    connection.commit();
                    res.json({ status: 200, message: `Se realizo correctamente el registro de la entrada ${entradaId} generando el documento SAP numero ${resultResgisterSAP.DocNum}` });
                }

            }else{
                connection.rollback();
                res.json({ status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId}` });
            }

            

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

    public async getEntradaById(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql
            const { id } = req.params;
            //console.log(infoUsuario[0], bdmysql,id );
            let entradaObject = await helper.getEntradaById(id, bdmysql);
            res.json(entradaObject);
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async getEntradaByIdSL(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql
            const { id } = req.params;
            
            ////console.log(id );
            let entradaMysql = await helper.getEntradaByDocNum(id,bdmysql)
            let entradaObject = await helper.getEntradaByIdSL(infoUsuario[0],id);
            let fullname ="";
            if(entradaMysql.length > 0) {
                fullname = entradaMysql[0].fullname;
            }

            entradaObject.value[0].Users.fullname = fullname;

            ////console.log('resultSL',entradaObject.value[0].Users);
            res.json(entradaObject);


        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async cancel(req: Request, res: Response): Promise<void> {
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken = await helper.validateToken(jwt);
         //******************************************************* */
         const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
         const bdmysql = infoUsuario[0].bdmysql
         const {id} = req.params;
         const  data  = req.body;
         //console.log(data);
         
 
         try {

                //const entrada = await helper.getEntradaById(id, bdmysql);
                
                const EntradaSap = await helper.getEntradaByIdSL(infoUsuario[0],data.sapdocnum);
                
                
                const DocEntry = EntradaSap.value[0].PurchaseDeliveryNotes.DocEntry;
                //console.log(DocEntry);

                const dataCancel:any = {
                    "Document": {
                        "Comments": data.comment,
                        "DocEntry": DocEntry
                    }
                }
                const resultCancelEntradaSAP = await helper.cancelarEntrada(infoUsuario[0],dataCancel);
                //console.log(dataForSAP);

                
                console.log(resultCancelEntradaSAP);

                if (resultCancelEntradaSAP.error) {
                    console.log(resultCancelEntradaSAP.error);
                    res.json({status: 501, err: `Ocurrio un error en la cancelación de la entrada ${data.sapdocnum}: ${resultCancelEntradaSAP.error.message.value}` });
                }else{

                    //console.log(resultResgisterSAP.DocNum);
                    //Actualizar  sapdocnum, entrada

                    const entradaCancel = await helper.getEntradasByBaseDoc(infoUsuario[0],DocEntry,20);
                    console.log(entradaCancel);

                    let queryUpdateEntrada = `Update ${bdmysql}.entrada t0 Set t0.status='C', t0.cancelDocNumSAP ='${entradaCancel.value[0].PurchaseDeliveryNotes.DocNum}'  where t0.id = ?`;
                    let resultUpdateEntrada = await db.query(queryUpdateEntrada,[id]);

                    //console.log(resultUpdateEntrada);

                    res.json({ status: 200, message: `Se realizo correctamente la anulación de la entrada ${data.sapdocnum} generando el documento de cancelación SAP numero ${entradaCancel.value[0].PurchaseDeliveryNotes.DocNum}` });
                }


            } catch (err) {
                // Print errors
                console.log(err);
                
                res.json({ err, status: 501 });
            }   
    }

    public async entradasByPedido(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql
            const { id } = req.params;
            //console.log(infoUsuario[0], bdmysql,id );
            let entradasObject = await helper.getEntradasByPedido(infoUsuario[0],id);
            res.json(entradasObject);
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }


    

}

const entradaController = new EntradaController();
export default entradaController; 