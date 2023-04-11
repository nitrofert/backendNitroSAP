import { Application, Request, Response } from "express";
import http from 'http';

import {db }from "../database";
//import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';


class WssapController {

    public url_sap_xe = 'https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/';
    public url_sap_sl = 'https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/';

    public async BusinessPartners(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try{

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        //console.log("BusinessPartners ",bieSession);

        if(bieSession!=''){
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/BusinessPartners?$filter=startswith(CardCode,'P'), CardType eq 'cSupplier'&$select=CardCode,CardName`;
            //const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/BusinessPartners?$filter=CardCode eq 'PN830511745'&$select=CardCode,CardName`;
        
        
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''
                    
                }
                
            }

            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();

            //console.log(data2.value);

            helper.logoutWsSAP(bieSession);
            
            return res.json(data2.value);
        }
     
        return res.json({error:501});

    } catch (error) {
        console.log(error);
        return '';
    }
        
    }

    public async Items(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try{

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        //console.log("Items",bieSession);
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }      
            }
    
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Items?$select=ItemCode,ItemName,ApTaxCode&$orderby=ItemCode`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2.value);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2.value);
        }
        
        return res.json({error:501}); 

    } catch (error) {
        console.log(error);
        return '';
    }
    }

    public async Cuentas(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try{

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        //console.log("Items",bieSession);
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }      
            }
    
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/ChartOfAccounts?$select=Code,Name&$orderby=Code`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2.value);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2.value);
        }
        
        return res.json({error:501}); 

    } catch (error) {
        console.log(error);
        return '';
    }
    }

    public async CuentasXE(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsCuentasContables.xsjs?compania=${compania}`;
            console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
    }

    public async itemsSolpedXengine(req: Request, res: Response) {
        

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
    
        //******************************************************* */

        try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;

            //const data = await helper.itemsSolpedXengine(compania);
            
            //return res.json(data);  
            //const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItems.xsjs?compania=${compania}`;
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItemsSolped.xsjs?compania=${compania}`;
            console.log(url2);
            const response2 = await fetch(url2);
            const data2 = await response2.json();   
            return res.json(data2);   
            
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        } 
    
}

    public async itemsXengine(req: Request, res: Response) {
        

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        
            //******************************************************* */

            try {

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItems.xsjs?compania=${compania}`;
            //const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItemsSolped.xsjs?compania=${compania}`;
            
 

            console.log(url2);
            
         
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
        
    }

    public async monedasXengine(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;

            let { fechaTrm } = req.params;
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsMonedas.xsjs?fecha=${await helper.format(fechaTrm)}&compania=${compania}`;
            console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
        
    }

    public async SeriesXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try{
            
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;

            let { objtype } = req.params;

            let filtroObjtype = "";
            if(objtype) filtroObjtype = `&tipodoc=${objtype}`;
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
            console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
        
    }

    public async Series(req: Request, res: Response) {

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

            let filtroObjtype = "";
            if(objtype) filtroObjtype = `&tipodoc=${objtype}`;
            
            //console.log(await helper.format(fechaTrm));
            /*
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
            console.log(url2);
            
        
            const response2 = await fetch(url2);
            const data2 = await response2.json();   
            return res.json(data2);*/
            
            const series = await db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='${objtype}'`);
            //console.log(series);
            return res.json(series);
    
        }catch (error: any) {
                console.error(error);
                return res.json(error);
        } 
        
    }

    public async BusinessPartnersXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;
        let { id } = req.params;
            
        //console.log(id);
        let proveedor ='';

        let proveedores = await helper.getProveedoresXE(infoUsuario[0]);
    
        /*const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}${proveedor}`;
        const response2 = await fetch(url2);
        const data2 = await response2.json();*/   
        return res.json(proveedores);   

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }  
        
    }

    public async sociosDeNegocio(req: Request, res: Response) {

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

    public async AprobacionesXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;
        let { id } = req.params;
            
        //console.log(id);
        let proveedor ='';
        let querys = `SELECT * FROM "PRUEBAS_NITROFERT_PRD"."OITM"`;
        //console.log(querys);
    
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&querys=${querys}`;
        

        
        
            const response2 = await fetch(url2);
            const data2 = await response2.json();   
            return res.json(data2);   

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
        
    }

    public async OrdenesUsuarioXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;
        const userSap = infoUsuario[0].codusersap;

            
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsOcAbiertasPorUsuario.xsjs?compania=${compania}&usuario=${userSap}`;
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();
                //console.log(data2);   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
        
    }


    public async OrdenesUsuarioSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try{

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        const perfilesUsuario:any[] = await helper.getPerfilesUsuario(decodedToken.userId);
        //console.log("Items",bieSession);
        let filtroPorUsuario = "";
        
        if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
            filtroPorUsuario = ` and PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL eq '${infoUsuario[0].codusersap}' `;
        }

        let data = {
            QueryPath: `$crossjoin(PurchaseOrders,PurchaseOrders/DocumentLines)`,
            QueryOption: `$expand=PurchaseOrders($select=DocEntry,DocNum,Series,DocDate,DocDueDate,CardCode,CardName,DocTotal,Comments),
                                  PurchaseOrders/DocumentLines($select=LineNum,
                                                                       LineStatus,
                                                                       ItemCode,
                                                                       ItemDescription,
                                                                       Quantity,
                                                                       ShipDate,
                                                                       Currency,
                                                                       Price,
                                                                       LineTotal,
                                                                       TaxCode,
                                                                       TaxTotal,
                                                                       GrossTotal,
                                                                       WarehouseCode,
                                                                       CostingCode,
                                                                       CostingCode2,
                                                                       CostingCode3,
                                                                       U_ID_PORTAL,
                                                                       U_NF_NOM_AUT_PORTAL)
                           &$filter=PurchaseOrders/DocEntry eq PurchaseOrders/DocumentLines/DocEntry  and 
                                    PurchaseOrders/DocumentLines/LineStatus eq 'O' and 
                                    PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL ne null
                                    ${filtroPorUsuario}`
           }
        
           //console.log(data);
         
        if(bieSession!=''){
            const configWs2 = {
                method:"POST", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                },
                body: JSON.stringify(data)      
            }
    
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/QueryService_PostQuery`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2.value);
        }
        
        return res.json({error:501}); 
    } catch (error) {
        console.log(error);
        return '';
    }
    }


    public async PedidoByIdSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        try{

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        
        //console.log("Items",bieSession);

        let { pedido } = req.params;
        
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }    
            }
    
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders(${pedido})`;
            console.log(url2);
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2);
        }
        
        return res.json({error:501}); 

    } catch (error) {
        console.log(error);
        return '';
    }
    }

    public async getAreasSolpedSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        
        //console.log("Items",bieSession);

        let { pedido } = req.params;
        
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }    
            }
    
            //const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/USU?$select=NF_ALM_USUARIOS_SOLCollection`;
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(USU,USU/NF_ALM_USUARIOS_SOLCollection)?$expand=USU/NF_ALM_USUARIOS_SOLCollection($select=U_NF_DIM2_DEP)&$filter=USU/Code eq USU/NF_ALM_USUARIOS_SOLCollection/Code and USU/NF_ALM_USUARIOS_SOLCollection/U_NF_DIM2_DEP ne null`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2);
        }
        
        return res.json({error:501}); 

        } catch (error) {
            console.log(error);
            return '';
        }
        
    }

    

    public async getUnidadItemSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        
        //console.log("Items",bieSession);

        let { ItemCode } = req.params;
        
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }    
            } 
    
            
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Items?$filter=ItemCode eq '${ItemCode}'&$select=PurchaseUnit`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2);
        }
        
        return res.json({error:501}); 

        } catch (error) {
            console.log(error);
            return '';
        }
        
    }

    public async getAlmacenesMPSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        try {

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bieSession = await helper.loginWsSAP(infoUsuario[0]);
        
        //console.log("Items",bieSession);

        
        
         
        if(bieSession!=''){
            const configWs2 = {
                method:"GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''   
                }    
            }
    
            
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Warehouses?$filter=Inactive eq 'N' and startswith(WarehouseCode,'AD') or   startswith(WarehouseCode,'TR')&$select=State,WarehouseCode,WarehouseName`;
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2);
        }
        
        return res.json({error:501}); 

        } catch (error) {
            console.log(error);
            return '';
        }
        
    }

    


}

const wssapController = new WssapController();
export default wssapController;