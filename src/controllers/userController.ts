import { Request, Response } from "express";

import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import helper from "../lib/helpers";


class UserController{
    
    public async list(req: Request, res: Response){

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

       const  users:UserInterface[] =  await db.query("SELECT * FROM users"); 
       


       res.json(users);
    }

    public async getUserById(req: Request, res: Response){
       
         //Obtener datos del usurio logueado que realizo la petición
         let jwt = req.headers.authorization;
         if(jwt){
             jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             
         }   
         //******************************************************* */
        const {id} = req.params;
        const  user:UserInterface[] =  await db.query("SELECT * FROM usuariosportal.users where id= ?",[id]); 
        res.json(user);
     }

     public async getCompaniesUserById(req: Request, res: Response){
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            
        }   
        //******************************************************* */
       const {id} = req.params;
       const  userCompanies =  await db.query(`
       SELECT t0.id,t0.companyname, 
              (SELECT COUNT(*) 
              FROM company_users t1 
              WHERE t1.id_company = t0.id AND 
                    id_user = ?)AS company_access 
        FROM companies t0 
        WHERE t0.status = 'A'
       `,[id]); 
       res.json(userCompanies);

     }

     public async getPerfilesUserById(req: Request, res: Response){
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            
        }   
        //******************************************************* */
       const {id} = req.params;
       const  userPerfiles =  await db.query(`
       SELECT *, 
              (SELECT COUNT(*) 
               FROM perfil_users t1 
               WHERE t1.id_perfil = t0.id AND 
                     t1.id_user = ?) AS perfil_user
        FROM perfiles t0  
        WHERE estado = 'A'
       `,[id]); 
       res.json(userPerfiles);

     }


    public async create(req: Request, res: Response): Promise<void>{

         const user:UserInterface = req.body;
         console.log(user);
         user.password = await helper.encryptPassword(user.password ||'');
         const result = await db.query('INSERT INTO users set ?', [user]);
         res.json(result);
     }

     public async update(req: Request, res: Response){
        
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */
        const user:UserInterface = req.body;
        console.log(user);
         const idUser = user.id;
         const newUser:UserInterface = {
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            status: user.status,
            codusersap: user.codusersap
         }
         if(user.password!=""){
            user.password = await helper.encryptPassword(user.password ||'');
            newUser.password = user.password;
         } 

         console.log(user);

         const result = await db.query('update users set ? where id = ?', [newUser,idUser]);
         res.json(result);

    }

    public async setCompaniesUser(req: Request, res: Response){
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            
        }   
        //******************************************************* */
        
        const accessRequest = req.body;
        let sqlAccess = "";
        if(accessRequest.valor==0){
            //Eliminar acceso de la empresa seleccionada
            sqlAccess = `Delete from company_users where id_company = ? and id_user = ?`;
        }else{
            //Otorgar acceso a la empresa seleccionada
            sqlAccess = `Insert into company_users (id_company,id_user) values(?,?)`;
        }

        const result = await db.query(sqlAccess, [accessRequest.id_company,accessRequest.id_user]);

        res.json(result);

    }

    public async setPerfilUser(req: Request, res: Response){
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
            
        }   
        //******************************************************* */
        
        const perfilRequest = req.body;
        let sqlAccess = "";
        if(perfilRequest.valor==0){
            //Eliminar acceso de la empresa seleccionada
            sqlAccess = `Delete from perfil_users where id_perfil = ? and id_user = ?`;
        }else{
            //Otorgar acceso a la empresa seleccionada
            sqlAccess = `Insert into perfil_users (id_perfil,id_user) values(?,?)`;
        }

        const result = await db.query(sqlAccess, [perfilRequest.id_perfil,perfilRequest.id_user]);

        res.json(result);

    }

}

const userController = new UserController();
export default userController;