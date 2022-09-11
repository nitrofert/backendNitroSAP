import { Request, Response } from "express";

import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";


class SolpedController {

    public async list(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        //console.log(bdmysql);

        const solped: CompanyInterface[] = await db.query(`Select * from ${bdmysql}.solped`);
        //console.log(solped);
        res.json(solped);
    }
    public async create(req: Request, res: Response): Promise<void> {

         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
         //******************************************************* */
        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql
        const newSolped = req.body;
        console.log(newSolped.solped);
        let connection = await db.getConnection();

        try{
            await connection.beginTransaction();
            let querySolped = `Insert into ${bdmysql}.solped set ?`;
            newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
            newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
            newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
            newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);

            let resultInsertSolped = await connection.query(querySolped,[newSolped.solped]);
            console.log(resultInsertSolped);

            let solpedId = resultInsertSolped.insertId;
            let newSolpedDet = [];
            let newSolpedLine =[];
            for(let item in newSolped.solpedDet){
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
                newSolpedLine=[];
            }

            console.log(newSolpedDet);
            let queryInsertDetSolped = `
                Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                 acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                 ocrcode3,whscode,id_user) values ?
            `;
            const resultInsertSolpedDet = await connection.query(queryInsertDetSolped,[newSolpedDet]);

            console.log(resultInsertSolpedDet);

            connection.commit();
            res.json({message:`Se realizo correctamnente el registro de la solped ${solpedId}`});

        }catch (err) {
            // Print errors
            console.log(err);
            // Roll back the transaction
            connection.rollback();
            res.json({err,status:501});
        } finally {
            if (connection) await connection.release();
        }
        
                    
          


    }
    public async getSolpedById(req: Request, res: Response) {

         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
         //******************************************************* */
        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql

        const { id } = req.params;



        const solpedResult: any[] = await db.query(`
      
        SELECT * FROM ${bdmysql}.solped T0 INNER JOIN ${bdmysql}.solped_det T1 ON T0.id = T1.id_solped WHERE t0.id = ?`, [id]);

        console.log((solpedResult));
        
        let solped:any = {
            id,
            id_user:solpedResult[0].id_user,
            usersap:solpedResult[0].usersap,
            fullname:solpedResult[0].fullname,
            serie:solpedResult[0].serie,
            doctype:solpedResult[0].doctype,
            status:solpedResult[0].status,
            sapdocnum:solpedResult[0].sapdocnum,
            docdate:solpedResult[0].docdate,
            docduedate:solpedResult[0].docduedate,
            taxdate:solpedResult[0].taxdate,
            reqdate:solpedResult[0].reqdate,
            u_nf_depen_solped:solpedResult[0].u_nf_depen_solped,
            approved:solpedResult[0].approved
        }
        let solpedDet:any[]=[];
        for(let item of solpedResult) {
            
            solpedDet.push({
                    id_solped: item.id_solped,
                    linenum: item.linenum,
                    linestatus: item.linestatus,
                    itemcode: item.itemcode,
                    dscription: item.dscription,
                    reqdatedet: item.reqdatedet,
                    linevendor: item.linevendor,
                    acctcode: item.acctcode,
                    acctcodename: item.acctcodename,
                    quantity: item.quantity,
                    moneda: item.moneda,
                    trm: item.trm,
                    price: item.price,
                    linetotal: item.linetotal,
                    tax: item.tax,
                    taxvalor: item.taxvalor,
                    linegtotal: item.linegtotal,
                    ocrcode: item.ocrcode,
                    ocrcode2: item.ocrcode2,
                    ocrcode3: item.ocrcode3,
                    whscode: item.whscode,
                    id_user: item.id_user
            });
        }


        let solpedObject ={
            solped,
            solpedDet
        }
        //console.log((solpedObject));
        res.json(solpedObject);
    }
    public async update(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
        //******************************************************* */
       const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
       const bdmysql = infoUsuario.bdmysql
       const newSolped = req.body;
       console.log(newSolped); 
        
       let connection = await db.getConnection();

       try{
           await connection.beginTransaction();
           let solpedId = newSolped.solped.id;
           newSolped.solped.docdate = await helper.format(newSolped.solped.docdate);
           newSolped.solped.docduedate = await helper.format(newSolped.solped.docduedate);
           newSolped.solped.taxdate = await helper.format(newSolped.solped.taxdate);
           newSolped.solped.reqdate = await helper.format(newSolped.solped.reqdate);
           //Actualizar encabezado solped 
           let querySolped = `Update ${bdmysql}.solped set ? where id = ?`;
           let resultUpdateSolped = await connection.query(querySolped,[newSolped.solped,solpedId]);
           console.log(resultUpdateSolped);

           //Borrar detalle Solped seleccionada
           querySolped = `Delete from ${bdmysql}.solped_det where id_solped = ?`;
           let resultDeleteSolpedDet = await connection.query(querySolped,[solpedId]);
           console.log(resultDeleteSolpedDet);

           
           let newSolpedDet = [];
           let newSolpedLine =[];
           for(let item in newSolped.solpedDet){
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
               newSolpedLine=[];
           }

           console.log(newSolpedDet);
           let queryInsertDetSolped = `
               Insert into ${bdmysql}.solped_det (id_solped,linenum,itemcode,dscription,reqdatedet,linevendor,
                acctcode,acctcodename,quantity,price,moneda,trm,linetotal,tax,taxvalor,linegtotal,ocrcode,ocrcode2,
                ocrcode3,whscode,id_user) values ?
           `;
           const resultInsertSolpedDet = await connection.query(queryInsertDetSolped,[newSolpedDet]);

           console.log(resultInsertSolpedDet);

           connection.commit();
           res.json({message:`Se realizo correctamnente la actualización de la solped ${solpedId}`});

       }catch (err) {
           // Print errors
           console.log(err);
           // Roll back the transaction
           connection.rollback();
           res.json({err,status:501});
       } finally {
           if (connection) await connection.release();
       }
       


    }



}

const solpedController = new SolpedController();
export default solpedController;