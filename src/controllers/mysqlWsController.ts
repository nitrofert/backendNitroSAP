import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import path from 'path';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";
import fs from 'fs';


class MySQLWsController {

    public async clientes(req: Request, res: Response) {
       
        const params = req.query;

        console.log(params);

        try{
            let where = "";
            if(params.cardcode){
                if(where==""){
                    where = ` WHERE t0.CardCode = '${params.cardcode}' `;
                }else{
                    where = ` AND t0.CardCode = '${params.cardcode}' `;
                }
            }
            let query = `SELECT * FROM ${params.compania}.socios_negocio t0 ${where}`;
            let cleintes:any = await await db.query(query);

            console.log(cleintes);

            res.json(cleintes);
    
        }catch (error: any) {
                console.error(error);
                return res.json(error);
        }
    }

    
    
    

    
    

    
    

    

    
   
}

const mysqlWsQueriesController = new MySQLWsController();
export default mysqlWsQueriesController; 