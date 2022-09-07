import { Application, Request, Response } from "express";
import http from 'http';

import db from "../database";
//import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';


class WssapController {

    

    public async BusinessPartners(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bieSession = await helper.loginWsSAP(infoUsuario);
        console.log("BusinessPartners ",bieSession);

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
        console.log("Items",bieSession);
         
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
        console.log("Items",bieSession);
         
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

    public async itemsXengine(req: Request, res: Response) {

        
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/WSNTF.xsjs`;

            /*http.get(url2,(resp)=>{
                console.log(resp);
            });*/
    
            const response2 = await fetch(url2);
            //console.log(response2.body); 
            const data2 = await response2.json(); 
    
            //console.log(data2);
    
            
            
            return res.json(data2);  
        
    }



}

const wssapController = new WssapController();
export default wssapController;