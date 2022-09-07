import { Request, Response } from "express";

import db from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";


class SharedFunctionsController {

    public async taxes(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        console.log(bdmysql);
        let where = "";
        if(req.params.taxOption){
            where = ` where ${req.params.taxOption} = 'Y'` 
        }

        const solped: any[] = await db.query(`Select * from ${bdmysql}.taxes ${where}`);
        console.log(JSON.stringify(solped));
        res.json(solped);
    }





}

const sharedFunctionsController = new SharedFunctionsController();
export default sharedFunctionsController;