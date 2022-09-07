import { Request, Response } from "express";

import db from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";


class SolpedController {

    public async list(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        console.log(bdmysql);

        const solped: CompanyInterface[] = await db.query(`Select * from ${bdmysql}.solped`);
        console.log(solped);
        res.json(solped);
    }



    public async create(req: Request, res: Response): Promise<void> {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const newSolped = req.body;
        console.log(newSolped);
        const result = await db.query('START TRANSACTION');
        console.log(result);
        //const result = await db.query('INSERT INTO solped set ?', [newSolped]);
        
        
        res.json(result);
    }


    public async getSolpedById(req: Request, res: Response) {

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
    }

    public async update(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const company = req.body;
        console.log(company);
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


    }



}

const solpedController = new SolpedController();
export default solpedController;