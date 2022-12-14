import { Request, Response } from "express";

import {db }from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';


class SharedFunctionsController {

    public async taxes(req: Request, res: Response) {
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        //console.log(bdmysql);
        let where = "";
        if(req.params.taxOption){
            where = ` where ${req.params.taxOption} = 'Y'` 
        }

        
        
        
            const solped: any[] = await db.query(`Select * from ${bdmysql}.taxes ${where}`);
            res.json(solped);


        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async taxesXE(req: Request, res: Response) {
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const compania = infoUsuario[0].dbcompanysap;
       
        
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsImpuestosCompras.xsjs?compania=${compania}`;
    
        
        
            const response2 = await fetch(url2); 
            const data2 = await response2.json();  
            return res.json(data2);  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        } 
           
    }

    public async cuentasDependenciaXE(req: Request, res: Response) {
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
        console.log(dependencia);
        
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsCuentasXDependencia.xsjs?compania=${compania}&dependencia=${dependencia}`;
        

       
        
            const response2 = await fetch(url2); 
            const data2 = await response2.json();  
            return res.json(data2);  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
           
    }





}

const sharedFunctionsController = new SharedFunctionsController();
export default sharedFunctionsController;