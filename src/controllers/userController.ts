import { Request, Response } from "express";

import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import helper from "../lib/helpers";
import { InfoUsuario } from "../interfaces/decodedToken.interface";


class UserController{
    
    public async list(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */

      

       
        
        const  users:UserInterface[] =  await db.query("SELECT * FROM users"); 
       


       res.json(users);  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async getUserById(req: Request, res: Response){
        try {
         //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             //console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
         //******************************************************* */
        
            const {id} = req.params;
            const  user:UserInterface[] =  await db.query("SELECT * FROM users where id= ?",[id]); 

            

            /*const areas_usuario = await db.query(`SELECT t0.id, t0.codusersap, t0.area 
            FROM areas_user t0 
            INNER JOIN companies t1 ON t1.id = t0.companyid
            WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);*/

            const areas_usuario  = await helper.getAreasUserSAP(user[0].codusersap,bdmysql);

            const dependencias_usuario = await db.query(`SELECT t0.id, t0.codusersap, t0.vicepresidency, t0.dependence, t0.location 
            FROM dependencies_user t0 
            INNER JOIN companies t1 ON t1.id = t0.companyid
            WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);

            const almacenes_usuario = await db.query(`SELECT t0.id, t0.codusersap, t0.store
            FROM stores_users t0 
            INNER JOIN companies t1 ON t1.id = t0.companyid
            WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);

           
            user[0].areas = areas_usuario;
            user[0].dependencias = dependencias_usuario;
            user[0].almacenes = almacenes_usuario;

            console.log(user);

            res.json(user);
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            }
     }

     async getAreasByUserSAP(req: Request, res: Response){
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                 const decodedToken = await helper.validateToken(jwt);
                 const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
                 //console.log(infoUsuario);
                 const bdmysql = infoUsuario[0].bdmysql;
                 const compania = infoUsuario[0].dbcompanysap;
                 const codusersap = infoUsuario[0].codusersap;
            //******************************************************* */

            let error = false;
            let message = "";

            const areas_usuario  = await helper.getAreasUserSAP(codusersap,bdmysql);
            //console.log(areas_usuario);
            
            res.json(areas_usuario);  
    
            }catch (error: any) {
                console.error(error);
                return res.json(error);
            }

     }

     public async getCompaniesUserById(req: Request, res: Response){
        try {
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

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

     }

     public async getPerfilesUserById(req: Request, res: Response){
        try {
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

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
     }


    public async create(req: Request, res: Response): Promise<void>{

         const user:UserInterface = req.body;
         console.log(user);
         user.password = await helper.encryptPassword(user.password ||'');
         const result = await db.query('INSERT INTO users set ?', [user]);
         res.json(result);
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
                if(user.password){
                    user.password = await helper.encryptPassword(user.password ||'');
                    newUser.password = user.password;
                } 

                console.log(user);

                const result = await db.query('update users set ? where id = ?', [newUser,idUser]);
                res.json(result);
           

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    public async setCompaniesUser(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
        //******************************************************* */
        
        

        const accessRequest = req.body;

        const user = await helper.getUser(accessRequest.id_user);
        const company = await helper.getCompany(accessRequest.id_company);

        console.log(user,company);

        const infoUsuario:InfoUsuario ={
            bdmysql:company[0].bdmysql,
            codusersap:user[0].codusersap,
            companyname:company[0].companyname,
            dbcompanysap:company[0].dbcompanysap,
            email:user[0].email,
            fullname:user[0].fullname,
            id:accessRequest.id_user,
            id_company:accessRequest.id_company,
            logoempresa:company[0].logoempresa,
            status:user[0].status,
            urlwssap:company[0].urlwssap,
            username:user[0].username,
        };

            let error = false;
            let messageError = "";
            let result:any;

            let sqlAccess = "";
            if(accessRequest.valor==0){
                //Eliminar acceso de la empresa seleccionada
                sqlAccess = `Delete from company_users where id_company = ? and id_user = ?`;
            }else{
                
                //Buscar Usuario SAP en base de datos
                const userSAP = await helper.findUserSAPSL(infoUsuario);
                console.log(userSAP);
                if(userSAP.value.length==0){
                    //NO existe el usuario crear en SAP
                    const registerUserSAP = await helper.registerUserSAPSL(infoUsuario);
                    console.log(registerUserSAP);
                    if(registerUserSAP.error){
                        error= true;
                        messageError = registerUserSAP.error.message.value;
                    }
                }

                if(!error){
                    //Otorgar acceso a la empresa seleccionada
                    sqlAccess = `Insert into company_users (id_company,id_user) values(?,?)`;    
                }
                
            }

            if(!error){
                result = await db.query(sqlAccess, [accessRequest.id_company,accessRequest.id_user]);    
            }else{
                result = {error, messageError}
            }

            

            res.json(result);  

        }catch (err: any) {
            console.error(err);
            return res.json({error:true,messageError:err});
        }

    }

    public async setPerfilUser(req: Request, res: Response){
        try {
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

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    public async adicionarAreasUser(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let areas = data.areas;
            let error = false;
            let message = "";

            //validar si el usuario tiene udo creado en SAP
           

           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioSL(infoUsuario[0], codusersap);

            console.log(udoUsuario);

            let NF_ALM_USUARIOS_SOLCollection:any[] = [];
            let areasUser:any[] = [];
            let lineAreaUser:any[] = [];

            for(let area of areas) {
                NF_ALM_USUARIOS_SOLCollection.push({
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    
                    "Object": "USU",
                    
                    "U_NF_DIM2_DEP": area.U_NF_DIM2_DEP
                });

                lineAreaUser.push(codusersap);
                lineAreaUser.push(area.U_NF_DIM2_DEP);
                lineAreaUser.push(infoUsuario[0].id_company);
                lineAreaUser.push(userid);
                areasUser.push(lineAreaUser);
                lineAreaUser = [];

                console.log(areasUser);
            }

            if(udoUsuario.value.length > 0) {
                //Registrar areas en udo de areas
                

                let dataUdoAreas = {
                    NF_ALM_USUARIOS_SOLCollection
                }

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], dataUdoAreas,  udoUsuario.value[0].USU.Code,'PATCH');
                console.log('resultUpdateUdo',resultUpdateUdo);
                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar las areas del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                    

                }

            }else{
                //Crear udo para usuario en SAP
                
                let dataUdo = {
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    "Name": null,
                    "Canceled": "N",
                    "Object": "USU",
                    "UserSign": infoUsuarioSAP.value[0].InternalKey,
                    "DataSource": "I",
                    "U_NF_COD_USUARIO":  infoUsuarioSAP.value[0].InternalKey,
                    "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                    NF_ALM_USUARIOS_SOLCollection
                }

                let resultNewUdo = await helper.registerUdoSAPSL(infoUsuario[0], dataUdo);
                console.log('resultNewUdo',resultNewUdo);

                if(resultNewUdo!=201){
                    //Error al crear UDO
                    error = true;
                    message = "Ocurio un error al crear el UDO del usuario en SAP"; 
                }else{
                    //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    
                }
            }

            if(!error){
                let resultRegisterAreasUserMSQL = await helper.RegisterAreasUserMSQL(areasUser);
                if(resultRegisterAreasUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al registrar las areas del usuario en mysql";
                }else{
                    message = "Se ha registrado correctamente las areas seleccionadas";
                }
            }

            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    public async adicionarDependenciasUser(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let dependencias = data.dependencias;
            let error = false;
            let message = "";

            //validar si el usuario tiene udo creado en SAP
           

           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioSL(infoUsuario[0], codusersap);

            console.log(udoUsuario);

            let NF_ALM_USUARIOS_VICCollection:any[] = [];
            let dependenciasUser:any[] = [];
            let linedependenciaUser:any[] = [];

            for(let dependencia of dependencias) {
                NF_ALM_USUARIOS_VICCollection.push({
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    
                    "Object": "USU",
                    "U_NF_DIM3_VICE": dependencia.U_NF_DIM3_VICE,
                    "U_NF_DIM2_DEP": dependencia.U_NF_DIM2_DEP,
                    "U_NF_DIM1_LOC": dependencia.U_NF_DIM1_LOC
                });

                linedependenciaUser.push(codusersap);
                linedependenciaUser.push(dependencia.U_NF_DIM2_DEP);
                linedependenciaUser.push(dependencia.U_NF_DIM1_LOC);
                linedependenciaUser.push(dependencia.U_NF_DIM3_VICE);
                linedependenciaUser.push(infoUsuario[0].id_company);
                linedependenciaUser.push(userid);
                dependenciasUser.push(linedependenciaUser);
                linedependenciaUser = [];

                console.log(dependenciasUser);
            }

            if(udoUsuario.value.length > 0) {
                //Registrar areas en udo de areas
                

                let dataUdoDependencias = {
                    NF_ALM_USUARIOS_VICCollection
                }

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], dataUdoDependencias,  udoUsuario.value[0].USU.Code,'PATCH');
                console.log('resultUpdateUdo',resultUpdateUdo);
                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar las areas del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                    

                }

            }else{
                //Crear udo para usuario en SAP
                
                let dataUdo = {
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    "Name": null,
                    "Canceled": "N",
                    "Object": "USU",
                    "UserSign": infoUsuarioSAP.value[0].InternalKey,
                    "DataSource": "I",
                    "U_NF_COD_USUARIO":  infoUsuarioSAP.value[0].InternalKey,
                    "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                    NF_ALM_USUARIOS_VICCollection
                }

                let resultNewUdo = await helper.registerUdoSAPSL(infoUsuario[0], dataUdo);
                console.log('resultNewUdo',resultNewUdo);

                if(resultNewUdo!=201){
                    //Error al crear UDO
                    error = true;
                    message = "Ocurio un error al crear el UDO del usuario en SAP"; 
                }else{
                    //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    
                }
            }

            if(!error){
                let resultRegisterDependenciasUserMSQL = await helper.RegisterDependenciasUserMSQL(dependenciasUser);
                if(resultRegisterDependenciasUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al registrar las dependencias del usuario en mysql";
                }else{
                    message = "Se ha registrado correctamente las dependencias seleccionadas";
                }
            }

            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    public async elimnarAreasUsuario(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             //console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            //console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let areas = data.areas;
            let error = false;
            let message = "";

            let idareas = areas.map((area: { id: any; })=>{
                return area.id;
            })
            console.log(areas,idareas);

            

            //validar si el usuario tiene udo creado en SAP
           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);

            console.log(udoUsuario);

            if(udoUsuario.error){
               
            }else{
                let NF_ALM_USUARIOS_SOLCollection:any[] = [];
                for(let areasUDO of udoUsuario.NF_ALM_USUARIOS_SOLCollection){
                    console.log(areasUDO.U_NF_DIM2_DEP);
                    if(areas.filter((area: { area: any; }) => area.area == areasUDO.U_NF_DIM2_DEP).length==0){
                        NF_ALM_USUARIOS_SOLCollection.push(areasUDO);
                    }
                }

                console.log(NF_ALM_USUARIOS_SOLCollection);

                udoUsuario.NF_ALM_USUARIOS_SOLCollection = NF_ALM_USUARIOS_SOLCollection;

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], udoUsuario,  infoUsuarioSAP.value[0].InternalKey,'PUT');
                console.log('resultUpdateUdo',resultUpdateUdo);

                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar las areas del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                }
            }

            if(!error){
                let resultDeleteAreasUserMSQL = await helper.deleteAreasUserMSQL(areas);
                if(resultDeleteAreasUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al elimminar las areas del usuario en mysql";
                }else{
                    message = "Se ha eliminado correctamente las areas seleccionadas";
                }
            }

                       

          

            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    

    
    public async eliminarDependenciasUser(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             //console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            //console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let dependencias = data.dependencias;
            let error = false;
            let message = "";

            let iddependencias = dependencias.map((dependencia: { id: any; })=>{
                return dependencia.id;
            })
            console.log(dependencias,iddependencias);

            

            //validar si el usuario tiene udo creado en SAP
           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);

            console.log(udoUsuario);

            if(udoUsuario.error){
               
            }else{
                let NF_ALM_USUARIOS_VICCollection:any[] = [];
                for(let dependenciasUDO of udoUsuario.NF_ALM_USUARIOS_VICCollection){
                    
                    if(dependencias.filter((dependencia: { dependence: any; vicepresidency:any; location:any; }) =>  dependencia.vicepresidency == dependenciasUDO.U_NF_DIM3_VICE && dependencia.dependence == dependenciasUDO.U_NF_DIM2_DEP && dependencia.location == dependenciasUDO.U_NF_DIM1_LOC).length==0){
                        NF_ALM_USUARIOS_VICCollection.push(dependenciasUDO);
                    }
                }

                //console.log(NF_ALM_USUARIOS_VICCollection);

                udoUsuario.NF_ALM_USUARIOS_VICCollection = NF_ALM_USUARIOS_VICCollection;

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], udoUsuario,  infoUsuarioSAP.value[0].InternalKey,'PUT');
                console.log('resultUpdateUdo',resultUpdateUdo);

                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar las dependencias del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                }
            }

            if(!error){
                let resultDeleteDependenciasUserMSQL = await helper.deleteDependenciasUserMSQL(dependencias);
                if(resultDeleteDependenciasUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al elimminar las dependencias del usuario en mysql";
                }else{
                    message = "Se ha eliminado correctamente las dependencias seleccionadas";
                }
            }

                       

          
            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }


    public async adicionarAlmacenUser(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let almacenes = data.almacenes;
            let error = false;
            let message = "";

            //validar si el usuario tiene udo creado en SAP
           

           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioSL(infoUsuario[0], codusersap);

            console.log(udoUsuario);

            let NF_ALM_USUARIOS_DETCollection:any[] = [];
            let almacenUser:any[] = [];
            let lineAlmacenUser:any[] = [];

            for(let almacen of almacenes) {
                NF_ALM_USUARIOS_DETCollection.push({
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    
                    "Object": "USU",
                    
                    "U_NF_ALMACEN": almacen.WarehouseCode
                });

                lineAlmacenUser.push(codusersap);
                lineAlmacenUser.push(almacen.WarehouseCode);
                lineAlmacenUser.push(infoUsuario[0].id_company);
                lineAlmacenUser.push(userid);
                almacenUser.push(lineAlmacenUser);
                lineAlmacenUser = [];

                console.log(almacenUser);
            }

            if(udoUsuario.value.length > 0) {
                //Registrar areas en udo de areas
                

                let dataUdoAlmacenes = {
                    NF_ALM_USUARIOS_DETCollection
                }

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], dataUdoAlmacenes,  udoUsuario.value[0].USU.Code,'PATCH');
                console.log('resultUpdateUdo',resultUpdateUdo);
                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar las areas del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                    

                }

            }else{
                //Crear udo para usuario en SAP
                
                let dataUdo = {
                    "Code": infoUsuarioSAP.value[0].InternalKey,
                    "Name": null,
                    "Canceled": "N",
                    "Object": "USU",
                    "UserSign": infoUsuarioSAP.value[0].InternalKey,
                    "DataSource": "I",
                    "U_NF_COD_USUARIO":  infoUsuarioSAP.value[0].InternalKey,
                    "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                    NF_ALM_USUARIOS_DETCollection
                }

                let resultNewUdo = await helper.registerUdoSAPSL(infoUsuario[0], dataUdo);
                console.log('resultNewUdo',resultNewUdo);

                if(resultNewUdo!=201){
                    //Error al crear UDO
                    error = true;
                    message = "Ocurio un error al crear el UDO del usuario en SAP"; 
                }else{
                    //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    
                }
            }

            if(!error){
                let resultRegisterAlmacenesUserMSQL = await helper.RegisterAlmacenesUserMSQL(almacenUser);
                if(resultRegisterAlmacenesUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al registrar los almacenes del usuario en mysql";
                }else{
                    message = "Se ha registrado correctamente los almacenes seleccionados";
                }
            }

            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    public async elimnarAlmacenUsuario(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
             const decodedToken = await helper.validateToken(jwt);
             const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
             //console.log(infoUsuario);
             const bdmysql = infoUsuario[0].bdmysql;
             const compania = infoUsuario[0].dbcompanysap;
        //******************************************************* */
        
            const data = req.body;

            //console.log(data);
            let codusersap = data.usuario;
            let userid =data.userid;
            let almacenes = data.almacenes;
            let error = false;
            let message = "";

            let idalmacenes = almacenes.map((area: { id: any; })=>{
                return area.id;
            })
            console.log(almacenes,idalmacenes);

            

            //validar si el usuario tiene udo creado en SAP
           
            const infoUsuarioSAP = await helper.getUsuarioSAPSL(infoUsuario[0], codusersap);
            const udoUsuario  = await helper.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);

            console.log(udoUsuario);

            if(udoUsuario.error){
               
            }else{
                let NF_ALM_USUARIOS_DETCollection:any[] = [];
                for(let almacenesUDO of udoUsuario.NF_ALM_USUARIOS_DETCollection){
                   
                    if(almacenes.filter((almacen: { store: any; }) => almacen.store == almacenesUDO.U_NF_ALMACEN).length==0){
                        NF_ALM_USUARIOS_DETCollection.push(almacenesUDO);
                    }
                }

                console.log(NF_ALM_USUARIOS_DETCollection);

                udoUsuario.NF_ALM_USUARIOS_DETCollection = NF_ALM_USUARIOS_DETCollection;

                let resultUpdateUdo = await helper.updateUdoSAPSL(infoUsuario[0], udoUsuario,  infoUsuarioSAP.value[0].InternalKey,'PUT');
                console.log('resultUpdateUdo',resultUpdateUdo);

                if(resultUpdateUdo!=204){
                    //Error updated areas
                    error = true;
                    message = "Ocurio un error al actualizar los almacenes del UDO en SAP"; 
                }else{
                    //Actualización exitosa, registrar en MYSQL las nuevas areas
                    message = "Se actualizaron correctamente los almacenes seleccionados en el UDO SAP"; 
                }
            }

            if(!error){
                let resultDeleteAreasUserMSQL = await helper.deleteAlmacenesUserMSQL(almacenes);
                if(resultDeleteAreasUserMSQL.error){
                    error = true;
                    message = "Ocurio un error al elimminar los almacenes del usuario en mysql";
                }else{
                    message = "Se ha eliminado correctamente los almacenes seleccionadas";
                }
            }

                       

          

            res.json({error, message});  

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

    }

    

}

const userController = new UserController();
export default userController;