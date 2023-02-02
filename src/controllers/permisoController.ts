import { Request, Response } from "express";

import {db} from "../database";
import { PermisosInterface } from "../interfaces/permiso.interface";
import helper from "../lib/helpers";


class PermisoController{
    
    public async list(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* /

       

       
            const  permisos:PermisosInterface[] =  await db.query(`
        
            SELECT t0.id AS idPerfil,
                t0.perfil,
                    t1.id AS idMenu, 
                    t1.title,
                    IFNULL(t2.read_accion,0) AS read_accion,
                    IFNULL(t2.create_accion,0) AS create_accion,
                    IFNULL(t2.update_accion,0) AS update_accion,
                    IFNULL(t2.delete_accion,0) AS delete_accion,
                    IFNULL(t2.aproved_accion,0) AS aproved_accion  
            FROM perfiles t0 
            JOIN menu t1
            LEFT JOIN perfil_menu_accions t2 ON t0.id = t2.id_perfil AND t1.id = t2.id_menu 
            ORDER BY t0.id, t1.ordernum ASC`);
    
            res.json(permisos);

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
    }

    public async create(req: Request, res: Response): Promise<void>{
        try {
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization;
         if(jwt){
             jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
         }   
         //******************************************************* */

         const permiso = req.body;
         console.log(permiso);

                
            
            //Validar si el permiso esta registrado
            const existePermiso = await db.query(`
            SELECT COUNT(*) as cntPermisos
            FROM perfil_menu_accions 
            WHERE id_perfil = ? AND id_menu = ?
            `,[permiso.idPerfil,permiso.idMenu]);
            console.log(existePermiso);

            let SQLpermiso = "";
            if(existePermiso[0].cntPermisos > 0) {
                //Actualiza la accion del permiso
                SQLpermiso = `Update perfil_menu_accions 
                                set ${permiso.accion}=${permiso.valor}
                            where id_perfil = ? AND id_menu = ?`;
                const result = await db.query(SQLpermiso, [permiso.idPerfil, permiso.idMenu]);
                res.json(result);
            }else{
                //Inserta el permiso con los datos enviados
                let newPermiso:PermisosInterface = {
                    id_menu:permiso.idMenu,
                    id_perfil:permiso.idPerfil
                }
                if(permiso.accion ==='read_accion') newPermiso.read_accion = permiso.valor;
                if(permiso.accion ==='create_accion') newPermiso.create_accion = permiso.valor;
                if(permiso.accion ==='update_accion') newPermiso.update_accion = permiso.valor;
                if(permiso.accion ==='delete_accion') newPermiso.delete_accion = permiso.valor;
                if(permiso.accion ==='aproved_accion') newPermiso.aproved_accion = permiso.valor;
                console.log(newPermiso);
                SQLpermiso = `Insert into perfil_menu_accions set ? `;
                const result = await db.query(SQLpermiso, [newPermiso]);
                res.json(result);
            }

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }

        
     }


     public async getById(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

        const { id } = req.params; 

      

       
            const  perfil:PermisosInterface[] =  await db.query(`
        
            SELECT t0.*
            FROM perfiles t0
            where t0.id = ?
            ORDER BY t0.perfil ASC`,[id]);
            
            res.json(perfil);

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
    }

     public async update(req: Request, res: Response){
        try {
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

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
        
        
    }

    public async delete(req: Request, res: Response){
        try {
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
    

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
       
       
   }

     
}

const permisoController = new PermisoController();
export default permisoController;