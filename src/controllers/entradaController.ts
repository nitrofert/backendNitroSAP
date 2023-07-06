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
            console.log(infoUsuario);
            let where = "";

          

            if (perfilesUsuario.filter(perfil => perfil.perfil == 'Administrador').length === 0) {
                where = ` WHERE t0.id_user=${infoUsuario[0].id} `;
            }

            if (perfilesUsuario.filter(perfil => perfil.perfil === 'Aprobador Solicitud').length > 0) {
               
                where =` WHERE t0.id in (SELECT tt0.id_entrada FROM ${bdmysql}.aprobacionentrada tt0 WHERE tt0.usersapaprobador = '${infoUsuario[0].codusersap}') and 
                               t2.name!='SPMP' and 
                               t0.approved ='P' and 
                               t0.status !=''`;
            }

        

            ////console.log(decodedToken);
            let queryList = `SELECT t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t2.name AS "serieStr",
            t0.doctype,t0.status,t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,
            t0.reqdate,t0.comments,t0.trm,t0.codigoproveedor, t0.nombreproveedor,pedidonumsap,t0.approved,
           
            SUM(linetotal) AS "subtotal",SUM(taxvalor) AS "impuestos",SUM(linegtotal) AS "total"
            FROM ${bdmysql}.entrada t0
            INNER JOIN ${bdmysql}.entrada_det t1 ON t1.id_entrada = t0.id
            INNER JOIN ${bdmysql}.series t2 ON t0.serie = t2.code
            ${where}
            GROUP BY 
            t0.id,t0.id_user,t0.usersap,t0.fullname,t0.serie,t2.name,t0.doctype,t0.status,
            t0.sapdocnum,t0.docdate,t0.docduedate,t0.taxdate,t0.reqdate,
            t0.comments,t0.trm,t0.codigoproveedor, t0.nombreproveedor,pedidonumsap,t0.approved
            ORDER BY t0.id DESC`;

            console.log(queryList);

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
        const compania = infoUsuario[0].dbcompanysap;
        const origin = req.headers.origin;
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        //console.log(newEntrada);
        let connection = await db.getConnection();
        let modeloid: number = 0;

        try {

           
            await connection.beginTransaction();


            let querySolped = `Insert into ${bdmysql}.entrada set ?`;
            newEntrada.entrada.docdate = await helper.format(newEntrada.entrada.docdate);
            newEntrada.entrada.docduedate = await helper.format(newEntrada.entrada.docduedate);
            newEntrada.entrada.taxdate = await helper.format(newEntrada.entrada.taxdate);
            newEntrada.entrada.reqdate = await helper.format(newEntrada.entrada.reqdate);
            
          

            let resultInsertEntrada = await connection.query(querySolped, [newEntrada.entrada]);
            //let resultInsertEntrada = await db.query(querySolped, [newEntrada.entrada]);
            //console.log(resultInsertEntrada);

            let entradaId = resultInsertEntrada.insertId;
            let newEntradaDet:any[] = [];
            let newEntradaLine:any[] = [];
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
            //const resultInsertSolpedDet = await db.query(queryInsertDetSolped, [newEntradaDet]);

            //console.log(resultInsertSolpedDet);

            if(resultInsertSolpedDet.affectedRows){

                //Validar modelos de aprobacion para entradas
                let modeloAprobacionesSAP:any[] = await helper.modeloAprobacionesMysql(infoUsuario[0],newEntrada.entrada.u_nf_depen_solped, 'HE');
                //console.log('modeloAprobacionesSAP',modeloAprobacionesSAP);
                if(modeloAprobacionesSAP.length>0){
                    
                    //validar modelo segun area

                    let newAprobacionLine: any[] = [];
                    let arrayResultEvalModelos: any[] = [];

                    //Recorrer los modelos filtrados para evaluar las condiciones en la solped
                    for (let modelo of modeloAprobacionesSAP) {
                        //Query que valida si la entrada cumple con la condicion dada en el modelo
                        if(modelo.area === newEntrada.entrada.u_nf_depen_solped){
                            //console.log(modelo);
                            //Validar que no exista una linea de aprobación en estado pendiente para la entrada
                            let existeNivel = `Select COUNT(*) AS filas from ${bdmysql}.aprobacionentrada where id_entrada = ${entradaId} and nivel = ${modelo.nivel} and estadoap='P' and estadoseccion='A'`;
                            let resultExisteNivel = await db.query(existeNivel);

                            if(resultExisteNivel[0].filas ==0){

                                modeloid = modelo.modeloid;
                                newAprobacionLine.push(entradaId);
                                newAprobacionLine.push(newEntrada.entrada.id_user);
                                newAprobacionLine.push(infoUsuario[0].codusersap);
                                newAprobacionLine.push(infoUsuario[0].email);
                                newAprobacionLine.push(infoUsuario[0].fullname);
                                newAprobacionLine.push(modelo.area);
                                newAprobacionLine.push('');
                                //newAprobacionLine.push(modelo.condicion);
                                newAprobacionLine.push(modelo.aprobadorusercode);
                                newAprobacionLine.push(modelo.emailaprobador);
                                newAprobacionLine.push(modelo.aprobadornombre);
                                newAprobacionLine.push(modelo.nivel);


                                console.log(newAprobacionLine);

                                let queryInsertnewAprobacion = `
                                Insert into ${bdmysql}.aprobacionentrada (id_entrada,
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
                                //const resultInsertnewAprobacion = await db.query(queryInsertnewAprobacion, [newAprobacionLine]);
                                console.log('resultInsertnewAprobacion',resultInsertnewAprobacion);
                                if (resultInsertnewAprobacion.affectedRows > 0) {
                                    //arrayResultEvalModelos.push({ status: "success", message: 'ok' });
                                    connection.commit();
                                    await helper.logaccion(infoUsuario[0],`Entrada ${entradaId}: Se registro correctamente la linea de aprobación ${JSON.stringify(newAprobacionLine)}`);
                                    newAprobacionLine = [];
                                    //Actualizar el estado de la solped a Pendiente
                                    //console.log('Actualizar el estado de la solped a Pendiente',entradaId);
                                    let queryUpdateSolped = `UPDATE ${bdmysql}.entrada t0 set t0.approved = 'P' where t0.id in (?)`;
                                    //const result = await db.query(queryUpdateSolped, [entradaId]);
                                    const result = await db.query(queryUpdateSolped, [entradaId]);
                                    //console.log('resultupdateEntrada',result);
                                    await helper.logaccion(infoUsuario[0],`Solped ${entradaId}: Se actualizo correctamente a P el estado de aprobación de la entrada`);

                                    //Envio de notificacion aprobacion de entrada

                                    console.log('Envio de notificacion aprobacion de entrada',entradaId);
                                    let entradaNotificacion:any;
                                    //obtener remitente y siguiente destinarario de aprobación solped
                                    entradaNotificacion = await helper.getEntradaById(entradaId, bdmysql);
                                    console.log('entradaNotificacion',entradaNotificacion);
                                    let LineAprovedEntrada:any = await helper.getNextLineAprovedEntrada(entradaId, bdmysql,compania,infoUsuario[0].logoempresa,origin,urlbk);
                                    console.log('LineAprovedEntrada',LineAprovedEntrada);
                                    if(LineAprovedEntrada!=''){
                                        let aprobadorCrypt = await helper.generateToken(LineAprovedEntrada,'24h');
                                        let html:string = await helper.loadBodyMailEntradaAp(infoUsuario[0],
                                                                                            LineAprovedEntrada,
                                                                                            infoUsuario[0].logoempresa,
                                                                                            entradaNotificacion,
                                                                                            aprobadorCrypt,
                                                                                            urlbk,
                                                                                            false,
                                                                                            true);
                                                                                    
                                        console.log('html',html);                    
                                        //Obtener datos de la solped a aprobar
                                        let infoEmail:any = {
                                            to:(urlbk.includes('localhost')==true || 
                                                urlbk.includes('-dev.')==true)?
                                                'ralbor@nitrofert.com.co':
                                                LineAprovedEntrada.aprobador.email,
                                            subject: `Solicitud de aprobación entrada ${entradaId}`,
                                            html
                                        }
                                        
                                        await helper.sendNotification(infoEmail);
                                        html= await helper.loadBodyMailEntradaAp(infoUsuario[0],
                                                                                LineAprovedEntrada,
                                                                                infoUsuario[0].logoempresa,
                                                                                entradaNotificacion,
                                                                                aprobadorCrypt,
                                                                                urlbk,
                                                                                false,
                                                                                false);
                                        infoEmail.html = html;
                                        infoEmail.to = (urlbk.includes('localhost')==true || 
                                                        urlbk.includes('-dev.')==true)?
                                                        'ralbor@nitrofert.com.co':
                                                        LineAprovedEntrada.autor.email; //enviar copia al autor de la solped
                                        await helper.sendNotification(infoEmail);

                                        //arrayAproved.push({message:`Solped ${id}: Se ha enviado correctamente a aprobación`});
                                        await helper.logaccion(infoUsuario[0],`Entrada ${entradaId}: Se envia notificación de aprobacion de la entrada a los siguientes destinatarios: ${LineAprovedEntrada.aprobador.email} ${LineAprovedEntrada.autor.email} `); 

                                        res.json({ status: 200, message: `Entrada ${entradaId}: Se envia notificación de aprobacion de la entrada a los siguientes destinatarios: ${LineAprovedEntrada.aprobador.email} ${LineAprovedEntrada.autor.email} ` });
                                    }else{
                                        res.json({status: 501, err: `Error al encontrar linea de aprobación para la entrada ${entradaId} ` });
                                        }
                                } else {
                                    //arrayResult.push({ solpedid: id, status: "error" });
                                    //errorInsertAprobacion = true;
                                    //arrayResultEvalModelos.push({ status: "error", message:`Error al registrar la linea de aprobación ${JSON.stringify(newAprobacionLine)} `})
                                    await helper.logaccion(infoUsuario[0],`Entrada ${entradaId}: Error al registrar la linea de aprobación ${JSON.stringify(newAprobacionLine)}`);
                                    connection.rollback();
                                    //error = true;
                                    res.json({status: 501, err: `Error al registrar la linea de aprobación ${JSON.stringify(newAprobacionLine)} ` });
                                }
                                
                            }else{
                                //Error existe una linea de aprobación
                                connection.rollback();
                                console.log(`Error no existe modelo de aprobacion para el area ${newEntrada.entrada.u_nf_depen_solped}`);
                                res.json({status: 501, err: `Error no existe modelo de aprobacion para el area ${newEntrada.entrada.u_nf_depen_solped}` });
                            }
                        }
                    }
                    

                }else{

                    
                    //Registrar entrada en SAP
                    let dataForSAP:any = await helper.loadInfoEntradaToJSONSAP(newEntrada);
                    console.log(dataForSAP);
                    //registrar Entrada en SAP
                    
                    const resultResgisterSAP = await helper.registerEntradaSAP(infoUsuario[0],dataForSAP);

                    if (resultResgisterSAP.error) {
                        //console.log(resultResgisterSAP.error.message.value);
                        connection.rollback();
                        res.json({status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId} ${resultResgisterSAP.error.message.value}` });
                    }else{

                        //console.log(resultResgisterSAP.DocNum);
                        //Actualizar  sapdocnum, entrada
                        connection.commit();
                        let queryUpdateEntrada = `Update ${bdmysql}.entrada t0 Set t0.sapdocnum ='${resultResgisterSAP.DocNum}'  where t0.id = ?`;
                        //let resultUpdateEntrada = await connection.query(queryUpdateEntrada,[entradaId]);
                        let resultUpdateEntrada = await db.query(queryUpdateEntrada,[entradaId]);

                        //console.log(resultUpdateEntrada);
                        
                        //connection.commit();
                        res.json({ status: 200, message: `Se realizo correctamente el registro de la entrada ${entradaId} generando el documento SAP numero ${resultResgisterSAP.DocNum}` });
                    }
                    
                } 
                

            }else{
                connection.rollback();
                res.json({ status: 501, err: `Ocurrio un error en el registro de la entrada ${entradaId}` });
            }

            

        } catch (err) {
            // Print errors
            console.error(err);
            // Roll back the transaction
            connection.rollback();
            res.json({ err, status: 501 });
        } finally {
            if (connection) await connection.release();
        }





    }

    

    public async aprobarEntradas(req: Request, res: Response): Promise<void> {
        
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql
        const entradas = req.body;
        const compania = infoUsuario[0].dbcompanysap;
        const logo = infoUsuario[0].logoempresa;
        const origin = req.headers.origin;
        let urlbk = req.protocol + '://' + req.get('host');
        const bdPresupuesto = (urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'COPIA_PRESUPUESTO':'PRESUPUESTO';
        //console.log(newEntrada);
        //let connection = await db.getConnection();
        let modeloid: number = 0;

        let messageEntrada = "";
        let arrayErrors:any[] = [];
        let arrayAproved:any[] = [];

        try {

           
            //await connection.beginTransaction();

           

            

            console.log('entradas',entradas);
            //Recorrer el array de ids entradas
            for(let entradaId of entradas){
                //Obtener infirmacion de la entrada
                let entradaNotificacion = await helper.getEntradaById(entradaId, bdmysql);

                let EntradaDet:any = entradaNotificacion.DocumentLines.map((linea: {
                    AccountCode: any;
                    cantidad: any;
                    ItemCode: any;
                    LineNum: any;
                    BaseEntry: any;
                    BaseType: any;
                    WarehouseCode: string;
                    CostingCode: any;
                    CostingCode2: any;
                    CostingCode3: any;
                    TaxCode: any;
                    Price: any;
                    ItemDescription: any; Currency: string; 
})=>{
                    return {
                        moneda:linea.Currency,
                        //Rate: Entrada.entrada.trm, //item.trm,
                        dscription:linea.ItemDescription,
                        //RequiredDate:item.reqdatedet,
                        //Quantity:item.cantidad,
                        //Price:item.precio,
                        precio:linea.Price,
                        //LineTotal:item.linetotal,
                        //GrossTotal:item.linegtotal,
                        tax:linea.TaxCode,
                        ocrcode:linea.CostingCode,
                        ocrcode2:linea.CostingCode2,
                        ocrcode3:linea.CostingCode3,
                        whscode:linea.WarehouseCode,
                        BaseType:linea.BaseType,
                        BaseEntry:linea.BaseEntry,
                        linenum:linea.LineNum,
                        itemcode:linea.ItemCode,
                        cantidad:linea.cantidad,
                        acctcode:linea.AccountCode,
                       

                    }
                })

                let entradaSAP:any = {
                    entrada:{
                        id:entradaNotificacion.id,
                        id_user: entradaNotificacion.id_user,
                        usersap: entradaNotificacion.usersap,
                        fullname: entradaNotificacion.fullname,
                        serie:entradaNotificacion.Series,
                        doctype: entradaNotificacion.DocType,
                        docdate:entradaNotificacion.DocDate,
                        docduedate: entradaNotificacion.DocDueDate,
                        taxdate:entradaNotificacion.TaxDate,
                        reqdate:entradaNotificacion.reqdate,
                        sapdocnum:entradaNotificacion.sapdocnum,
                        codigoproveedor:entradaNotificacion.CardCode,
                        nombreproveedor:entradaNotificacion.CardName,
                        comments:entradaNotificacion.Comments,
                        trm:entradaNotificacion.trm,
                        //currency:this.moneda==='COP'?'$':this.moneda,
                        currency:entradaNotificacion.currency,
                        pedidonumsap:entradaNotificacion.pedidonumsap,
                        u_nf_depen_solped:entradaNotificacion.u_nf_depen_solped,
                        U_NF_BIEN_OPORTUNIDAD:entradaNotificacion.U_NF_BIEN_OPORTUNIDAD,
                        U_NF_SERVICIO_CALIDAD:entradaNotificacion.U_NF_SERVICIO_CALIDAD,
                        U_NF_SERVICIO_TIEMPO:entradaNotificacion.U_NF_SERVICIO_TIEMPO,
                        U_NF_SERVICIO_SEGURIDAD:entradaNotificacion.U_NF_SERVICIO_SEGURIDAD,
                        U_NF_SERVICIO_AMBIENTE:entradaNotificacion.U_NF_SERVICIO_AMBIENTE,
                        U_NF_TIPO_HE:entradaNotificacion.U_NF_TIPO_HE,
                        U_NF_PUNTAJE_HE:entradaNotificacion.U_NF_PUNTAJE_HE,
                        U_NF_CALIFICACION:entradaNotificacion.U_NF_CALIFICACION,
                        footer:entradaNotificacion.footer,
                        U_NF_MES_REAL:entradaNotificacion.U_NF_MES_REAL
                    },
                    EntradaDet
                }
                //Obtener linea de aprobacion de la entrada y del usuario aprobador
                let queryLineaAprobacion = `Select * 
                                                from ${bdmysql}.aprobacionentrada t0 
                                                where t0.id_entrada = ${entradaId} and 
                                                    t0.usersapaprobador ='${infoUsuario[0].codusersap}' and 
                                                    t0.estadoseccion='A'`;
                let resultLineaAprobacion =  await db.query(queryLineaAprobacion);
                console.log('resultLineaAprobacion',resultLineaAprobacion);
                //Validar que la linea de aprobacion de la entrada y perteneciente al usuario aprobador este en estado P pendiente
                if(resultLineaAprobacion[0].estadoap === 'P'){
                    //Obtener información del proximo aprobador
                    let LineAprovedEntrada:any = await helper.getNextLineAprovedEntrada(entradaId, 
                        bdmysql,
                        compania,
                        logo,
                        req.headers.origin ,
                        urlbk,
                        resultLineaAprobacion[0].id);

                   // console.log('LineAprovedEntrada',LineAprovedEntrada,'kjlsdkfsdlkfjsdlkjfsdlkjfdsñlkjfsdlfjksdlkj');

                    if(LineAprovedEntrada!=''){
                        await helper.logaccion(infoUsuario[0],`Solped:${entradaId} Se envia notificacion a prximo aprobador: ${infoUsuario[0].fullname} `);
                        //Envio de notificacion para siguiente aprobador
                        //let aprobadorCrypt = await helper.generateToken(LineAprovedEntrada,'24h');
                        let aprobadorCrypt = '';
                        let html:string = await helper.loadBodyMailEntradaAp(infoUsuario[0],
                            LineAprovedEntrada,
                            logo,
                            entradaNotificacion,
                            aprobadorCrypt,
                            urlbk,
                            true,
                            true);
                        

                        let infoEmail:any = {
                            to:(urlbk.includes('localhost')==true || 
                                urlbk.includes('-dev.')==true)?
                                'ralbor@nitrofert.com.co':
                                LineAprovedEntrada.aprobador.email,
                            subject: `Solicitud de aprobación entrada ${entradaId}`,
                            html
                        }
                        
                        await helper.sendNotification(infoEmail);

                        //Envio de copia notificacion para autor entrada
                        html= await helper.loadBodyMailEntradaAp(infoUsuario[0],
                                                                LineAprovedEntrada,
                                                                infoUsuario[0].logoempresa,
                                                                entradaNotificacion,
                                                                aprobadorCrypt,
                                                                urlbk,
                                                                false,
                                                                false);

                       
                        infoEmail.html = html;
                        infoEmail.to = (urlbk.includes('localhost')==true || 
                                        urlbk.includes('-dev.')==true)?
                                        'ralbor@nitrofert.com.co':
                                        LineAprovedEntrada.autor.email; //enviar copia al autor de la solped
                        await helper.sendNotification(infoEmail);
                        
                        messageEntrada = `La entrada fue aprobada y fue notificado a siguiente aprobador del proceso ${LineAprovedEntrada.aprobador.fullname}`;
                        await helper.logaccion(infoUsuario[0],`Entrada:${entradaId}  ${messageEntrada} `);
                        console.log(messageEntrada);
                        arrayAproved.push({message:`Entrada ${entradaId}: ${messageEntrada}`});

                        let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionentrada t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                        let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);
                        
                    }else{
                       
                            //Registro de entrada en SAP
                            console.log('Registro de entrada en SAP');
                            

                            //Registrar entrada en SAP
                            let dataForSAP:any = await helper.loadInfoEntradaToJSONSAP(entradaSAP);
                            console.log(dataForSAP);
                            //registrar Entrada en SAP
                            const resultResgisterSAP = await helper.registerEntradaSAP(infoUsuario[0],dataForSAP);

                            if (resultResgisterSAP.error) {
                                //console.log(resultResgisterSAP.error.message.value);
                                //connection.rollback();
                                await helper.logaccion(infoUsuario[0],`Entrada:${entradaId}  Ocurrio un error en el registro de la entrada ${entradaId} ${resultResgisterSAP.error.message.value} `);
                                arrayErrors.push({message:`Entrada ${entradaId}: Ocurrio un error en el registro de la entrada ${entradaId} ${resultResgisterSAP.error.message.value}`});
                            }else{

                                //console.log(resultResgisterSAP);
                                //Actualizar  sapdocnum, entrada
                                let queryUpdateEntrada = `Update ${bdmysql}.entrada t0 Set t0.sapdocnum ='${resultResgisterSAP.DocNum}', t0.approved='A'  where t0.id = ?`;
                                //let resultUpdateEntrada = await connection.query(queryUpdateEntrada,[entradaId]);
                                let resultUpdateEntrada = await db.query(queryUpdateEntrada,[entradaId]);

                                let queryUpdateLineAproved = `Update ${bdmysql}.aprobacionentrada t0 Set t0.estadoap = 'A', t0.updated_at= CURRENT_TIMESTAMP where t0.id = ?`;
                                let resultUpdateLineAproved = await db.query(queryUpdateLineAproved,[resultLineaAprobacion[0].id]);

                                //console.log('resultUpdateEntrada',resultUpdateEntrada);
                                
                                //connection.commit();
                                await helper.logaccion(infoUsuario[0],`Entrada:${entradaId}  Se realizo correctamente el registro de la entrada generando el documento SAP numero ${resultResgisterSAP.DocNum} `);
                                arrayAproved.push({message:`Entrada ${entradaId}: Se realizo correctamente el registro de la entrada generando el documento SAP numero ${resultResgisterSAP.DocNum}`});

                                //let aprobadorCrypt = await helper.generateToken(LineAprovedEntrada,'24h');

                                LineAprovedEntrada =  {
                                    autor: {
                                        fullname: resultLineaAprobacion[0].nombreautor,
                                        email: resultLineaAprobacion[0].emailautor,
                                    },
                                    aprobador: {
                                        fullname: resultLineaAprobacion[0].nombreaprobador,
                                        email: resultLineaAprobacion[0].emailaprobador,
                                        usersap: resultLineaAprobacion[0].usersapaprobador,
                    
                                    },
                                    infoEntrada: {
                                        id_entrada: entradaId,
                                        idlineap: resultLineaAprobacion[0].id,
                                        bdmysql,
                                        companysap:compania,
                                        logo,
                                        origin:req.headers.origin,
                                        sapdocnum:resultResgisterSAP.DocNum
                                    }
                                };

                                let aprobadorCrypt = '';
                                let html:string = await helper.loadBodyMailApprovedEntrada(infoUsuario[0],
                                    LineAprovedEntrada,
                                    logo,
                                    entradaSAP,
                                    aprobadorCrypt,
                                    urlbk,
                                    true);
                                
                                    //console.log('html',html);

                                    //enviar Autorizacion al autor de la solped

                                    let infoEmail:any = {
                                        to:(urlbk.includes('localhost')==true || urlbk.includes('-dev.')==true)?'ralbor@nitrofert.com.co':LineAprovedEntrada.autor.email,
                                        subject: `Aprobación entrada ${entradaId}`,
                                        html
                                    }


                                    
                                    await helper.sendNotification(infoEmail);

                                   //console.log('infoEmail',infoEmail);

                            }
                            


                    }
                }else{
                    //Mensaje de entrada ya aprobada
                    console.log('Estado diferente de P estado actual es '+resultLineaAprobacion[0].estadoap);
                    arrayErrors.push({message:`Entrada ${entradaId}: Estado diferente de P estado actual es ${resultLineaAprobacion[0].estadoap}`});
                }

            }

            res.json({  status: 200, arrayErrors, arrayAproved });
            

        } catch (err) {
            // Print errors
            console.error(err);
            // Roll back the transaction
            arrayErrors.push({message:err})
            //connection.rollback();
            res.json({ err, status: 501, arrayErrors });
        }/*finally {
            if (connection) await connection.release();
        }*/





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