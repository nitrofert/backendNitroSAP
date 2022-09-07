import { Request, Response } from "express";

import db from "../database";
import { MenuInterface } from "../interfaces/menu.interface";
import { UserInterface } from "../interfaces/user.interface";
import helper from "../lib/helpers";


class ConfigController{
    
    public async list(req: Request, res: Response){

        //Obtener datos del usurio logueado que realizo la petición
        const {id} = req.params;
        console.log(req.params);
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            //console.log(decodedToken);
        }   
         
        //******************************************************* */
        const sql:string = `SELECT t0.* 
        FROM menu t0 
        INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
        WHERE t1.id_perfil IN (SELECT t10.id 
                    FROM perfiles t10 
                    INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id 
                    WHERE t11.id_user = ${id}) AND
             
              t1.read_accion = TRUE
        ORDER BY t0.ordernum ASC`;

        console.log(sql);
       
       
            
       const  menu:MenuInterface[] =  await db.query(sql);
       let menupadres:MenuInterface[] = menu.filter(opcion => opcion.hierarchy=='P');
       let menuhijos:MenuInterface[] = menu.filter(opcion => opcion.hierarchy=='H');
       let menuportal:any[]=[{
            label: 'Inicio',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/portal'] }
            ]
       }];
       let items:any[];

       for(let opcionMenuPadre of menupadres ){
            items=[];
            for(let opcionMenuHijo of menuhijos ){
                if(opcionMenuPadre.id == opcionMenuHijo.iddad){
                    items.push({label: opcionMenuHijo.title, icon:opcionMenuHijo.icon, routerLink: [opcionMenuHijo.url]});
                }
            }
            menuportal.push({
                label: opcionMenuPadre.title,
                items:items
            });
       }

       console.log(menuportal);

       res.json(menuportal);
    }

    
    
}

const configController = new ConfigController();
export default configController;