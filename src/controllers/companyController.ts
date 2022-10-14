import { Request, Response } from "express";

import {db} from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import helper from "../lib/helpers";


class ComapnyController {

    public async list(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = await helper.validateToken(jwt);
            }
            //******************************************************* */

        

        

            const companies: CompanyInterface[] = await db.query("SELECT * from companies");
            // console.log(companies);
            res.json(companies);

       }catch (error: any) {
           console.error(error);
            res.json(error);
       }
    }

    public async listActive(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

       

        

            const companies: CompanyInterface[] = await db.query("SELECT * from companies where status ='A'");
            // console.log(companies);
            res.json(companies);

       }catch (error: any) {
           console.error(error);
            res.json(error);
       }
    }

    public async create(req: Request, res: Response): Promise<void> {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const newCompany = req.body;
       

        

             //console.log(newCompany);
            const result = await db.query('INSERT INTO companies set ?', [newCompany]);
            res.json(result);

        }catch (error: any) {
            console.error(error);
             res.json(error);
        }
    }


    public async getCompanyById(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const { id } = req.params;

        

        

            const comapny: CompanyInterface[] = await db.query(`
      
            SELECT t0.*
            FROM companies t0
            where t0.id = ?
            ORDER BY t0.companyname ASC`, [id]);

            res.json(comapny);

        }catch (error: any) {
            console.error(error);
             res.json(error);
        }
    }

    public async update(req: Request, res: Response) {
        
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const company = req.body;
        //console.log(company);
        const idCompany = company.id;
        const newCompany: CompanyInterface = {
            companyname: company.companyname,
            status: company.status,
            urlwsmysql: company.urlwsmysql,
            logoempresa: company.logoempresa,
            urlwssap: company.urlwssap,
            dbcompanysap: company.dbcompanysap

        }
        

        

            const result = await db.query('update companies set ? where id = ?', [newCompany, idCompany]);
            res.json(result);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }



}

const companyController = new ComapnyController();
export default companyController;