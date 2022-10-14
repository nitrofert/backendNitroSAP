import { Request, Response } from "express";

import {db} from "../database";
import { MenuInterface } from "../interfaces/menu.interface";
import helper from "../lib/helpers";


class MenuController{
    
    public async list(req: Request, res: Response){
       
        try {
            console.log(req.headers.origin);

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

            const  menu:MenuInterface[] =  await db.query(`
            
            SELECT t0.*,t1.title AS 'padre' 
            FROM menu t0
            LEFT JOIN menu t1 ON t0.iddad = t1.id
            ORDER BY t0.ordernum ASC`);
 
            res.json(menu);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async listFather(req: Request, res: Response){
        try {


            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if(jwt){
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = await helper.validateToken(jwt);
            }   
            //******************************************************* */

            const  menu:MenuInterface[] =  await db.query(`
            
            SELECT t0.*, '' as padre 
            FROM menu t0
            where hierarchy ='P'
            ORDER BY t0.ordernum ASC`);
            
            res.json(menu);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async orderNum(req: Request, res: Response){
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if(jwt){
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = await helper.validateToken(jwt);
            }   
            //******************************************************* */

            const {hierarchy, iddad } = req.params; 
       

            let result;
            
            if(hierarchy == 'P'){
                result = await db.query("Select IFNULL(MAX(ordernum),0)+1 as ordernum from menu where hierarchy= ?",[hierarchy]);
            }else{
                result = await db.query("SELECT IFNULL(MAX(ordernum),0) AS ordernum, (SELECT t0.ordernum FROM menu t0 WHERE t0.id = ?) AS ordernumdad FROM menu WHERE hierarchy= 'H' AND iddad = ? ",[iddad,iddad]);

                let ordernum = iddad+'.';
                if(result[0].ordernum!='0'){
                    let ordernumMax = result[0].ordernum;
                    
                    let arrayOrderNum = ordernumMax.split(".");
                    result[0].ordernum = arrayOrderNum[0]+'.'+(parseInt(arrayOrderNum[1])+1);

                }else{
                    result[0].ordernum = result[0].ordernumdad+'.'+1;
                }
            }

        res.json(result);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
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

            const newMenu = req.body;
            console.log(newMenu);
            const result = await db.query('INSERT INTO menu set ?', [newMenu]);
            res.json(result);

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
     }


    public async getMenuById(req: Request, res: Response){
        try {

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if(jwt){
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = await helper.validateToken(jwt);
            }   
            //******************************************************* */

            const { id } = req.params; 

            const  menu:MenuInterface[] =  await db.query(`
            
            SELECT t0.*,'' AS 'padre' 
            FROM menu t0
            where t0.id = ?
            ORDER BY t0.ordernum ASC`,[id]);
       
            res.json(menu);

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
                //console.log(req)
                const menu = req.body;
                //console.log(menu);
                const idMenu = menu.id;
                const newMenu = {
                title:menu.title,
                description:menu.description,
                ordernum:menu.ordernum,
                hierarchy:menu.hierarchy,
                iddad:menu.iddad,
                url:menu.url,
                icon:menu.icon
                }
                const result = await db.query('update menu set ? where id = ?', [newMenu,idMenu]);
                //console.log(idMenu,newMenu,result);
                res.json(result);

        }catch (error: any) {
            console.error(error);
            res.json(error);
        }
        
    }

     public delete(req: Request, res: Response){
        
        res.json({'text':'Delete Games controller '+req.params.id});
    }
}

const menuController = new MenuController();
export default menuController;