import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import path from 'path';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";
import fs from 'fs';


class MySQLController {

    public async series(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try{
            
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;
            let { objtype } = req.params;
            const series = await db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='${objtype}'`);
            //console.log(series);
            return res.json(series);
    
        }catch (error: any) {
                console.error(error);
                return res.json(error);
        }
    }

    public async items(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //******************************************************* */

            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
            
            const  items = await db.query(`SELECT *
                            FROM ${bdmysql}.items_sap t0
                            ORDER BY t0.ItemName ASC`);
           
            //console.log(items);
            res.json(items);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async cuentas(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;
        
            const cuentas = await db.query(`Select * From ${bdmysql}.cuentas_contable`);     

            return res.json(cuentas);

            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
    }

    public async impuestosCompra(req: Request, res: Response) {
          //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;
        
            const impuestos = await db.query(`Select * From ${bdmysql}.taxes where ValidForAP='Y'`);     

            return res.json(impuestos);

            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
    }

    public async almacenes(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;
        
            const almacenes = await db.query(`Select WhsCode_Code as "WarehouseCode",
                                                     WhsName as "WarehouseName",
                                                     Location_Code,
                                                     Location,
                                                     State_Code as "State",
                                                     Name_State,
                                                     Country_Code,
                                                     Name_Country,
                                                     Address2,
                                                     Address3
                                              From ${bdmysql}.almacenes`);     

            return res.json(almacenes);

            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
    }

    public async zonas(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;
        
            const zonas = await db.query(`Select Distinct 
                                                     State_Code as "State",
                                                     Name_State as "PENTRADA"
                                              From ${bdmysql}.almacenes
                                              Where State_Code !=''`);     

            return res.json(zonas);

            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
    }    

    public async sociosNegocio(req: Request, res: Response) {
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization || '';
         jwt = jwt.slice('bearer'.length).trim();
         const decodedToken = await helper.validateToken(jwt);
        
         //******************************************************* */
 
         try {
 
         const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
         const compania = infoUsuario[0].dbcompanysap;
         const bdmysql = infoUsuario[0].bdmysql;
         
         const proveedores = await db.query(`Select * From ${bdmysql}.socios_negocio t0`);
         
         
         return res.json(proveedores);   
 
         }catch (error: any) {
             console.error(error);
             return res.json(error);
         }  
    }

    public async areasUsuario(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        
            //******************************************************* */

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;

            const areas = await db.query(`Select * 
                                          From areas_user t0 
                                          INNER JOIN companies t1 ON t0.companyid = t1.id
                                          where t1.status ='A' and
                                                t1.urlwsmysql = '${bdmysql}' and
                                                t0.codusersap = '${infoUsuario[0].codusersap}'`);

            return res.json(areas);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async dependeciasUsuario(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
           
            //******************************************************* */
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const query = `SELECT * 
            FROM dependencies_user t0
            INNER JOIN companies t1 ON t1.id = t0.companyid 
            WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                  t1.urlwsmysql = '${bdmysql}' and
                  t1.status = 'A'`;
    
            //console.log(query);      
            const dependenciasUsuario = await db.query(query);
            //console.log(dependenciasUsuario);
            res.json(dependenciasUsuario);
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            }

    }

    public async almacenesUsuario(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
           
            //******************************************************* */
    
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
    
            const almacenesUsuario = await db.query(`SELECT * 
                                                        FROM stores_users t0 
                                                        INNER JOIN companies t1 ON t0.companyid = t1.id
                                                        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
                                                        t1.urlwsmysql = '${bdmysql}' and
                                                        t1.status = 'A'`);
            res.json(almacenesUsuario);
    
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }   

    public async cuentasDependencia(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        
            //******************************************************* */

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const compania = infoUsuario[0].dbcompanysap;
        
            let dependencia = req.params.dependencia;
            //console.log(dependencia);
            const cuentas = await db.query(`Select *
                                            From ${bdmysql}.cuentas_dependencias t0 
                                            Where t0.Code='${dependencia}'`);
        
            return res.json(cuentas);  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
           
    }
    
    public async monedas(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
           
            //******************************************************* */
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const query = `Select * from monedas`;
    
            //console.log(query);      
            const monedas = await db.query(query);
            //console.log(dependenciasUsuario);
            res.json(monedas);
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            }
    }
    
    

    
    

    

    
   
}

const mysqlQueriesController = new MySQLController();
export default mysqlQueriesController; 