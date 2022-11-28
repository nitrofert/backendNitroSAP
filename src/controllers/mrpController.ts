import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import path from 'path';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";
import fs from 'fs';


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
                                                              
            let totalInvMP:number = 0;
            for(let item of inventarioMP){
                totalInvMP = totalInvMP+eval(item.OnHand);
            }                                
            
            //Inventario de Materia prima en producto terminado simple            
            let inventarioPT:any = array_inventarios.filter( (infoItem: {
                                                                State: any;  ItemCode: any; 
                                                                INVENTARIO: string; 
                                                              })=>infoItem.INVENTARIO ==='PT' && infoItem.ItemCode === item  && infoItem.State === zona);

            let totalInvPT:number = 0;
            for(let item of inventarioPT){
                totalInvPT = totalInvPT+eval(item.OnHand);
            }                                
                                                              
            


            let totalInventario = {
                inventarioMP: totalInvMP,
                inventarioPT: totalInvPT
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
            
            //Obtener invetarios de Materia prima en transito que esten en una solped/OC en SAP
            let inventarios = await helper.getInventariosTrackingMPXE(infoUsuario[0]);
            let array_inventarios :any[] =  [];
            for(let item in inventarios) {  
                array_inventarios.push(inventarios[item]);
            }

            let {item, zona, fechainicio, fechafin } = req.body;

  
            console.log(req.body);
    
            //Inventario de materia prima en transito que esta en una orden de compra que su estatus es diferente a descargado
            let inventarioItemTransito = array_inventarios.filter(data=>data.TIPO ==='Compra' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.ETA) >= new Date(fechainicio) && 
            new Date(data.ETA) <= new Date(fechafin) &&
            data.U_NF_STATUS != 'Descargado');

            console.log(inventarioItemTransito);

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

            //Inventario de materia prima en transito que esta en una solped
            let inventarioItenSolicitado = array_inventarios.filter(data=>data.TIPO ==='Necesidad' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.FECHANECESIDAD) >= new Date(fechainicio) && 
            new Date(data.FECHANECESIDAD) <= new Date(fechafin));


            //Obtener compras proyectadas de materia prima en Mysql Portal
            let comprasProyectadas = await helper.getInventariosProyectados(infoUsuario[0]);
            let comprasProyectadasMP = comprasProyectadas.filter((data: { TIPO: string; State_Code: any; ItemCode: any; FECHANECESIDAD: string | number | Date; })=>data.TIPO ==='Proyectado' && 
            data.State_Code === zona && 
            data.ItemCode === item  &&
            new Date(data.FECHANECESIDAD) >= new Date(fechainicio) && 
            new Date(data.FECHANECESIDAD) <= new Date(fechafin));

            console.log(comprasProyectadasMP);

            let consolidadoInventarios = {
                inventarioItemTransito,
                totalInventarioItemZF,
                inventarioItenSolicitado,
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

           let {item, zona, fechainicio, fechafin} = req.body;

           let fechaI = new Date(fechainicio);
           let fechaF = new Date(fechafin);

           //console.log(fechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate());
           //console.log(fechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate());

            let queryList = `SELECT * FROM ${bdmysql}.presupuestoventa 
                                      WHERE  itemcode = '${item}' AND 
                                             codigozona = '${zona}' AND 
                                             fechasemana BETWEEN '${fechaI.getFullYear()+"-"+(fechaI.getMonth()+1)+"-"+fechaI.getDate()}' AND 
                                                                 '${fechaF.getFullYear()+"-"+(fechaF.getMonth()+1)+"-"+fechaF.getDate()}'`;

            let presupuesto = await db.query(queryList);

            //console.log('Presupuesto',queryList,presupuesto);

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
    
}

const mrpController = new MrpController();
export default mrpController; 