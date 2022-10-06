import { Application, Request, Response } from "express";
import http from 'http';

import {db }from "../database";
//import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';


class WssapController {

    public url_sap_xe = 'http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/';
    public url_sap_sl = 'https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/';

    public async BusinessPartners(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
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
        
    }



    public async Items(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
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
    }

    public async Cuentas(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
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
    }

    

    public async CuentasXE(req: Request, res: Response) {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;
        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsCuentasContables.xsjs?compania=${compania}`;

            try {
        
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
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;
        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsItems.xsjs?compania=${compania}`;

            try {
        
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
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;

            let { fechaTrm } = req.params;
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsMonedas.xsjs?fecha=${await helper.format(fechaTrm)}&compania=${compania}`;
            try {
        
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
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;

            let { objtype } = req.params;

            let filtroObjtype = "";
            if(objtype) filtroObjtype = `&tipodoc=${objtype}`;
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
            console.log(url2);
            try {
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return res.json(data2);   
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            } 
        
    }

    public async BusinessPartnersXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;
        let { id } = req.params;
            
        //console.log(id);
        let proveedor ='';
    
        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}${proveedor}`;
        try {
        
            const response2 = await fetch(url2);
            const data2 = await response2.json();   
            return res.json(data2);   

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }  
        
    }

    public async AprobacionesXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;
        let { id } = req.params;
            
        //console.log(id);
        let proveedor ='';
        let querys = `SELECT * FROM "PRUEBAS_NITROFERT_PRD"."OITM"`;
        //console.log(querys);
    
        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAprobaciones.xsjs?&querys=${querys}`;
        

        try {
        
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
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;
        const userSap = infoUsuario.codusersap;

            
            
            //console.log(await helper.format(fechaTrm));
        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsOcAbiertasPorUsuario.xsjs?compania=${compania}&usuario=${userSap}`;
            try {
        
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
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
        const perfilesUsuario = decodedToken.perfilesUsuario;
        //console.log("Items",bieSession);
        let filtroPorUsuario = "";
        
        if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
            filtroPorUsuario = ` and PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL eq '${infoUsuario.codusersap}' `;
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
    }


    public async PedidoByIdSL(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
        const perfilesUsuario = decodedToken.perfilesUsuario;
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
    
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();
    
            //console.log(data2);
    
            helper.logoutWsSAP(bieSession); 
            
           return res.json(data2);
        }
        
        return res.json({error:501}); 
    }




}

const wssapController = new WssapController();
export default wssapController;