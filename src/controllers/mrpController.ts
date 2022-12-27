import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import path from 'path';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";
import fs from 'fs';
import csv from 'csv-parser';
import moment from 'moment';


class MrpController {

    
    


    public async zonas(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            let inventarios = await helper.getInventariosMPXE(infoUsuario[0]);

            let zonas:any[]=[];
            let lineas:any[]=[];

            for(let item in inventarios){
                lineas.push(inventarios[item]);
            }
            let linea:any;
            for(let item of lineas){
                //console.log(item);
                if(zonas.filter(item2=>item2.State == item.State).length===0){
                    linea = {State:item.State,'PENTRADA':item.PENTRADA };
                    zonas.push(linea);
                }
            }

            //console.log(inventarios,zonas);

            res.json(zonas);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
  
    public async inventarios(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */
            
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const {item , zona} = req.body;
            console.log(req.body);
            //Obtener inventarios de SAP  de Materia prima a granel y en producto terminado Simple
            let inventarios = await helper.getInventariosMPXE(infoUsuario[0]);
            let array_inventarios :any[] =  [];
            for(let item in inventarios) {  
                array_inventarios.push(inventarios[item]);
            }

            //Inventario de Materia prima  a granel
            let inventarioMP:any = array_inventarios.filter( (infoItem: {
                                                                State: any;  ItemCode: any; 
                                                                INVENTARIO: string; 
                                                              })=>infoItem.INVENTARIO ==='MP' && infoItem.ItemCode === item  && infoItem.State === zona);
            console.log(inventarioMP);
                                                              
            let totalInvMP:number = 0;
            for(let item of inventarioMP){
                totalInvMP = totalInvMP+eval(item.OnHand);
            }                                
            
            //Inventario de Materia prima en producto terminado simple            
            let inventarioPT:any = array_inventarios.filter( (infoItem: {
                                                                State: any;  ItemCode: any; 
                                                                INVENTARIO: string; 
                                                              })=>infoItem.INVENTARIO ==='PT' && infoItem.ItemCode === item  && infoItem.State === zona);

            console.log(inventarioPT);

            let totalInvPT:number = 0;
            for(let item of inventarioPT){
                totalInvPT = totalInvPT+eval(item.OnHand);
            }                                
                                                              
            


            let totalInventario = {
                inventarioMP: totalInvMP,
                ubicacionInvetarioMP:inventarioMP,
                inventarioPT: totalInvPT,
                ubicacionInvetarioPT:inventarioPT
            }

            console.log(totalInventario);

            res.json(totalInventario);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
    
    public async inventariosTracking(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

           

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            let proveedores = await helper.objectToArray(await helper.getProveedoresXE(infoUsuario[0]));

            //console.log(proveedores);
            
            //Obtener invetarios de Materia prima en transito que esten en una solped/OC en SAP
            let inventarios = await helper.getInventariosTrackingMPXE(infoUsuario[0]);
            let array_inventarios :any[] =  [];
            for(let item in inventarios) {  
                array_inventarios.push(inventarios[item]);
            }

            let {item, zona, fechainicio, fechafin } = req.body;

  
            //console.log(req.body);
    
            //Inventario de materia prima en transito que esta en una orden de compra que su estatus es diferente a descargado
            let inventarioItemTransito = await array_inventarios.filter(data=>data.TIPO ==='Compra' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.ETA) >= new Date(fechainicio) && 
            new Date(data.ETA) <= new Date(fechafin) &&
            data.U_NF_STATUS != 'Descargado');

            //console.log('TRANSITO',inventarioItemTransito);

            //Inventario de materia prima en transito abierta con fecha anterior a la fecha de inicio calculadora
            let inventarioItemTransitoPreFecha = array_inventarios.filter(data=>data.TIPO ==='Compra' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.ETA) < new Date(fechainicio) &&
            data.U_NF_STATUS != 'Descargado');

            //console.log('TRANSITOPRE',inventarioItemTransitoPreFecha);

            //console.log('inventarioItemTransitoPreFecha',inventarioItemTransitoPreFecha);
            

            //Inventario de materia prima en transito que esta en una OC que su estatus es descargado en ZF
            let inventarioItemZF = array_inventarios.filter(data=>data.TIPO ==='Compra' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            //new Date(data.ETA) >= new Date(fechainicio) && 
            //new Date(data.ETA) <= new Date(fechafin) &&
            data.U_NF_STATUS == 'Descargado');

            let totalInventarioItemZF =0;

            if(inventarioItemZF.length>0){
                for(let item of inventarioItemZF){
                    totalInventarioItemZF = totalInventarioItemZF+eval(item.OpenCreQty);
                }
            }

            //Inventario de materia prima que esta en una solped
            let inventarioItenSolicitado = array_inventarios.filter(data=>data.TIPO ==='Necesidad' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.FECHANECESIDAD) >= new Date(fechainicio) && 
            new Date(data.FECHANECESIDAD) <= new Date(fechafin));

            //Inventario de materia prima  que esta en una solped abierta con fecha anterior a la fecha de inicio calculadora
            let inventarioItenSolicitadoPreFecha = array_inventarios.filter(data=>data.TIPO ==='Necesidad' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.FECHANECESIDAD) < new Date(fechainicio));

            //console.log('inventarioItenSolicitadoPreFecha',inventarioItenSolicitadoPreFecha);

            

            //Obtener compras proyectadas de materia prima en Mysql Portal
            let comprasProyectadas = await helper.getInventariosProyectados(infoUsuario[0]);
            let comprasProyectadasMP = comprasProyectadas.filter((data: { TIPO: string; State_Code: any; ItemCode: any; FECHANECESIDAD: string | number | Date; })=>data.TIPO ==='Proyectado' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.FECHANECESIDAD) >= new Date(fechainicio) && 
            new Date(data.FECHANECESIDAD) <= new Date(fechafin));

            //console.log('comprasProyectadasMP',comprasProyectadasMP);

            let consolidadoInventarios = {
                inventarioItemTransito,
                inventarioItemTransitoPreFecha,
                totalInventarioItemZF,
                inventarioItenSolicitado,
                inventarioItenSolicitadoPreFecha,
                inventarioItemZF,
                comprasProyectadasMP
            }

            //console.log(consolidadoInventarios);

            res.json(consolidadoInventarios);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
    

    public async presupuestosVenta(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

           

            let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa Order by fechasemana ASC`;

            let presupuesto = await db.query(queryList);

            console.log('Presupuesto',presupuesto);

            res.json(presupuesto);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }
    
    public async presupuestosVentaItem(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

           let {item, zona, fechainicio, fechafin} = req.body;

           let fechaI = new Date(fechainicio);
           let fechaF = new Date(fechafin);

           let fechaIMoment = moment(fechainicio);
           console.log(fechaIMoment.week());
           console.log(moment().isoWeek(fechaIMoment.week()).startOf('isoWeek'));

           //console.log(fechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate());
           //console.log(fechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate());

            let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa 
                                      WHERE  itemcode = '${item}' AND 
                                             codigozona = '${zona}' AND 
                                             fechasemana BETWEEN '${fechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate()}' AND 
                                                                 '${fechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate()}'`;

            let presupuesto = await db.query(queryList);

            console.log('Presupuesto',queryList,presupuesto);

            res.json(presupuesto);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async maxminItemZona(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            let {item, zona} = req.body;

            console.log(req.body);

            let queryList = `SELECT * FROM  ${bdmysql}.maxminitems WHERE itemcode = '${item}' AND zona = '${zona}'`;
            console.log(queryList);

            let maxminresult = await db.query(queryList);

            //console.log(inventarios);

            res.json(maxminresult);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async maxmin(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            

            //console.log(req.body);

            let queryList = `SELECT * FROM  ${bdmysql}.maxminitems`;
            console.log(queryList);

            let maxminresult = await db.query(queryList);

            //console.log(inventarios);

            res.json(maxminresult);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    

    public async cargarPresupuesto(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            let infoFilePresupuesto = req.body;

            //console.log(infoFilePresupuesto);
            let queryList = "";
            let queryRegistro = "";
            let lineasActualizadas = 0;
            let lineasRegistradas = 0;
            for(let linea of infoFilePresupuesto){
                console.log(new Date(linea.fechasemana));
                let fechasemana = new Date(linea.fechasemana);
                queryList = `SELECT * 
                             FROM ${bdmysql}.presupuestoventa 
                             WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                   semana =${linea.semana} AND 
                                   itemcode = '${linea.itemcode}' AND 
                                   codigozona = '${linea.codigozona}'`;

                //console.log(queryList);
                let result = await db.query(queryList);

                if(result.length>0){
                    //Actaliza linea
                    queryRegistro = `Update ${bdmysql}.presupuestoventa 
                                     SET cantidad = ${linea.cantidad.replace(',','.')}
                                     WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                           semana =${linea.semana} AND 
                                           itemcode = '${linea.itemcode}' AND 
                                           codigozona = '${linea.codigozona}'`;
                    lineasActualizadas++;
                }else{
                    //Insertar nuevalinea
                    let fechasemanaFormat = await helper.format(linea.fechasemana);
                    queryRegistro = `INSERT INTO ${bdmysql}.presupuestoventa (fechasemana,semana,itemcode,codigozona,cantidad) 
                                                                      values ('${fechasemanaFormat}',${linea.semana},'${linea.itemcode}','${linea.codigozona}',${linea.cantidad.replace(',','.')})`;
                    lineasRegistradas++;
                }

                //console.log(queryRegistro);

                let resultRegistro = await db.query(queryRegistro);
                console.log(resultRegistro);

            }

            let msgResult = {
                message:`Se ha realizado el cargue del presupuesto correctamente. Se actualizaron ${lineasActualizadas} lineas del presupuesto y se registraron ${lineasRegistradas} lineas nuevas `
            }

            

            res.json(msgResult);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async cargarPresupuesto2(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            let infoFilePresupuesto = req.body;

            let anexo:any = {
                
                nombre:req.file?.originalname ,
                size:req.file?.size,
                ruta:req.file?.path
            }

            console.log(anexo);
            console.log(fs.existsSync(anexo.ruta));
            let msgResult :any;

           

            if(fs.existsSync(anexo.ruta)){
                
                let results:any[] =  [];
                
                fs.createReadStream(anexo.ruta)
                .pipe(csv({separator: infoFilePresupuesto.separador}))
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    //console.log(results);
                    // [
                    //   { NAME: 'Daffy Duck', AGE: '24' },
                    //   { NAME: 'Bugs Bunny', AGE: '22' }
                    // ]

                    let queryList = "";
                    let queryRegistro = "";
                    let lineasActualizadas = 0;
                    let lineasRegistradas = 0;
                    for(let linea of results){
                        console.log(new Date(linea.FECHASEMANA));
                        let fechasemana = new Date(linea.FECHASEMANA);
                        queryList = `SELECT * 
                                    FROM ${bdmysql}.presupuestoventa 
                                    WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                        semana =${linea.SEMANA} AND 
                                        itemcode = '${linea.ITEM}' AND 
                                        codigozona = '${linea.CODIGOZONA}'`;

                        //console.log(queryList);
                        let result = await db.query(queryList);

                        if(result.length>0){
                            //Actaliza linea
                            queryRegistro = `Update ${bdmysql}.presupuestoventa 
                                            SET cantidad = ${linea.CANTIDAD.replace(',','.')}
                                            WHERE YEAR(fechasemana)=${fechasemana.getFullYear()} AND 
                                                semana =${linea.SEMANA} AND 
                                                itemcode = '${linea.ITEM}' AND 
                                                codigozona = '${linea.CODIGOZONA}'`;
                            lineasActualizadas++;
                        }else{
                            //Insertar nuevalinea
                            let fechasemanaFormat = await helper.format(linea.FECHASEMANA);
                            queryRegistro = `INSERT INTO ${bdmysql}.presupuestoventa (fechasemana,semana,itemcode,codigozona,cantidad) 
                                                                            values ('${fechasemanaFormat}',${linea.SEMANA},'${linea.ITEM}','${linea.CODIGOZONA}',${linea.CANTIDAD.replace(',','.')})`;
                            lineasRegistradas++;
                        }

                        //console.log(queryRegistro);

                        let resultRegistro = await db.query(queryRegistro);
                        //console.log(resultRegistro);

                    }

                    msgResult = {
                        message:`Se ha realizado el cargue del presupuesto correctamente. Se actualizaron ${lineasActualizadas} lineas del presupuesto y se registraron ${lineasRegistradas} lineas nuevas `
                    }

                    

                    res.json(msgResult);
                });

            }else{
                 msgResult = {
                    message:`No se ha cargado el archivo de presupuesto`
                }

                res.json(msgResult);
    
            } 
        

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

 

    public async cargarMaxMin(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;

            let infoFileaxMin = req.body;

            //console.log(infoFilePresupuesto);
            let queryList = "";
            let queryRegistro = "";
            let lineasActualizadas = 0;
            let lineasRegistradas = 0;
            for(let linea of infoFileaxMin){
                console.log(new Date(linea.fechasemana));
                let fechasemana = new Date(linea.fechasemana);
                queryList = `SELECT * 
                             FROM ${bdmysql}.maxminitems 
                             WHERE itemcode = '${linea.itemcode}' AND 
                                   zona = '${linea.codigozona}'`;

                //console.log(queryList);
                let result = await db.query(queryList);

                if(result.length>0){
                    //Actaliza linea
                    queryRegistro = `Update ${bdmysql}.maxminitems 
                                     SET minimo = ${linea.minimo.replace(',','.')}, maximo = ${linea.maximo.replace(',','.')}
                                     WHERE itemcode = '${linea.itemcode}' AND 
                                           zona = '${linea.codigozona}'`;
                    lineasActualizadas++;
                }else{
                    //Insertar nuevalinea
                    let fechasemanaFormat = await helper.format(linea.fechasemana);
                    queryRegistro = `INSERT INTO ${bdmysql}.maxminitems (itemcode,zona,minimo,maximo) 
                                                                      values ('${linea.itemcode}','${linea.codigozona}',${linea.minimo.replace(',','.')},${linea.maximo.replace(',','.')})`;
                    lineasRegistradas++;
                }

                //console.log(queryRegistro);

                let resultRegistro = await db.query(queryRegistro);
                console.log(resultRegistro);

            }

            let msgResult = {
                message:`Se ha realizado el cargue de los máximos y mínimos correctamente. Se actualizaron ${lineasActualizadas} lineas  y se registraron ${lineasRegistradas} lineas nuevas `
            }

            

            res.json(msgResult);
        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    
    
}

const mrpController = new MrpController();
export default mrpController; 