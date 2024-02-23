import { Request, Response } from "express";

import {db} from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import helper from "../lib/helpers";


class NoticiasController {

    public async list(req: Request, res: Response) {
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = await helper.validateToken(jwt);
            }
            //******************************************************* */

        
            //console.log(new Date().toISOString());
        

            const noticias: any[] = await db.query("SELECT * from noticias");
            // console.log(companies);
            res.json(noticias);

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

        let hoy = new Date();

        //******************************************************* */
            //const companies: CompanyInterface[] = await db.query("SELECT * from companies where status ='A'");
            const noticias: any[] = await db.query(`SELECT * from noticias t0 where '${hoy.toISOString().split('T')[0]}' BETWEEN t0.fechapub AND t0.fechafinpub`);
            // console.log(companies);
            res.json(noticias);

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

             const noticia = req.body;

             
            //console.log(company);
           
            const nuevaNoticia: any = {
                titulo: noticia.titulo,
                fechapub: noticia.fechapub.split('T')[0],
                fechafinpub: noticia.fechafinpub.split('T')[0],
                descripcion: noticia.descripcion,
                recurso: noticia.recurso,
                autor:noticia.autor
            }
       

        

             //console.log(newCompany);
            const result = await db.query('INSERT INTO noticias set ?', [nuevaNoticia]);
            res.json(result);

        }catch (error: any) {
            console.error(error);
             res.json(error);
        }
    }


    public async getNoticiaById(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if (jwt) {
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }
        //******************************************************* */

        const { id } = req.params;

        

        

            const noticia: any[] = await db.query(`SELECT * FROM noticias t0 where t0.id = ?`, [id]);

            res.json(noticia);

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

            const noticia = req.body;
            //console.log(company);
            const idNoticia = noticia.id;
            const updateNoticia: any = {
                titulo: noticia.titulo,
                estado: noticia.estado,
                fechapub: noticia.fechapub.split('T')[0],
                fechafinpub: noticia.fechafinpub.split('T')[0],
                descripcion: noticia.descripcion,
                recurso: noticia.recurso,
                
            }

            const result = await db.query('update noticias set ? where id = ?', [updateNoticia, idNoticia]);
            res.json(result);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }



}

const noticiasController = new NoticiasController();
export default noticiasController;