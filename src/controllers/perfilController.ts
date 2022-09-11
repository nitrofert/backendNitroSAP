import { Request, Response } from "express";

import {db} from "../database";
import { PerfilInterface } from "../interfaces/perfil.interface";
import helper from "../lib/helpers";


class PerfilController{
    
    public async list(req: Request, res: Response){

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

       const  perfil:PerfilInterface[] =  await db.query(`
       
       SELECT t0.* 
       FROM perfiles t0
       ORDER BY t0.perfil ASC`);
       


       res.json(perfil);
    }

    public async create(req: Request, res: Response): Promise<void>{

         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization;
         if(jwt){
             jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
         }   
         //******************************************************* */

         const newPerfil = req.body;
         console.log(newPerfil);
         const result = await db.query('INSERT INTO perfiles set ?', [newPerfil]);
         res.json(result);
     }


     public async getPerfilById(req: Request, res: Response){

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

        const { id } = req.params; 

       const  perfil:PerfilInterface[] =  await db.query(`
       
       SELECT t0.*
       FROM perfiles t0
       where t0.id = ?
       ORDER BY t0.perfil ASC`,[id]);
       
       res.json(perfil);
    }

     public async update(req: Request, res: Response){

         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization;
         if(jwt){
             jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
         }   
         //******************************************************* */

         const perfil = req.body;
         console.log(perfil);
         const idPerfil = perfil.id;
         const newPerfil = {
            perfil:perfil.perfil,
            description:perfil.description,
            estado:perfil.estado
         }
         const result = await db.query('update perfiles set ? where id = ?', [newPerfil,idPerfil]);
         res.json(result);
        
        
    }

     
}

const perfilController = new PerfilController();
export default perfilController;