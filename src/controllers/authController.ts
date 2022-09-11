import { Request, Response } from "express";
import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import  helper  from "../lib/helpers";
import jwt, { SignOptions } from 'jsonwebtoken';
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import fetch from 'node-fetch';


class AuthController{

    public async login(req: Request, res: Response){
        
        //console.log(req.body);
        //Recibe los campos del formulario Login y lo alamacenamos en una constante formLogin
        const formLogin = {
            username: req.body.username,
            password: await helper.encryptPassword(req.body.password),
            company: req.body.company
        }
        //console.log(formLogin);
        //Consultamos la tabla de usuarios con el nombre de usuario proporcionado en el formulario
        const  user:UserInterface[] =  await db.query(`
        
            SELECT t0.id, t0.username,t0.password, t2.id as companyid 
                FROM users t0 
                INNER JOIN company_users t1 ON t1.id_user = t0.id
                INNER JOIN companies t2 ON t1.id_company = t2.id
                WHERE (username = ? or email = ?) and id_company = ?`
            ,[formLogin.username,formLogin.username,formLogin.company]);

        // Validamos si el usuario buscado por el username existe, si no existe retornamos error
        if(user.length==0) return res.status(401).json({message:"Datos de inicio de sesión invalidos", status:401});
        //console.log(user);
        //Comparamos el pasword registrado en el formulario con el password obtenido del query x username
        const validPassword = await helper.matchPassword(req.body.password, (user[0].password || ''));
        //console.log(validPassword);
        // Si el passwornno coincide, retornamos error 
        if(!validPassword) return res.status(401).json({message:"Datos de inicio de sesión invalidos", status:401});
        
        //Obtener datos de usuario para ecriptar en token jwt
        
        const infoUsuario = await db.query(`
        SELECT t0.id, fullname, email, username, codusersap, t0.status, 
               id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap  
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`,[user[0].id,user[0].companyid]);
        
        const perfilesUsuario = await db.query(`SELECT t0.id, t0.perfil 
                                                FROM perfiles t0 
                                                INNER JOIN perfil_users t1 ON t1.id_perfil = t0.id 
                                                WHERE t1.id_user = ?`,[user[0].id]);
        
        const opcionesMenu = await db.query(`SELECT t0.* 
                                            FROM menu t0 
                                            INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
                                            WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                                                t0.hierarchy ='P' AND
                                                t1.read_accion = true
                                            ORDER BY t0.ordernum ASC;`,[user[0].id]);

        const opcionesSubMenu = await db.query(`SELECT t0.* 
                                                FROM menu t0 
                                                INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
                                                WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                                                    t0.hierarchy ='H' AND
                                                    t1.read_accion = true
                                                ORDER BY t0.ordernum ASC;`,[user[0].id]);

        //const dependenciasUsuario = await db.query(`SELECT * FROM dependencies_user WHERE codusersap = '${infoUsuario[0].codusersap}'`);
        const permisosUsuario = [];
        const almacenesUsuario = [];
        

        let userConfig ={
            infoUsuario:infoUsuario[0],
            perfilesUsuario,
            menuUsuario:{
                opcionesMenu,
                opcionesSubMenu
            }
        }

    
        //Retorno de respuesta exitosa y datos del usuario logueado o token
        //console.log(JSON.stringify(userConfig));
        
        const dataUser:string = JSON.stringify(userConfig);
        //const token:String = jwt.sign(dataUser,'secreetkey',signInOptions);
        const token:string = await helper.generateToken(userConfig);
        //console.log({message:`!Bienvenido ${userConfig.infoUsuario.fullname}¡`, status:200,infoUsuario,token});
        return res.json({message:`!Bienvenido ${userConfig.infoUsuario.fullname}¡`, status:200,infoUsuario,token});
    }

    public recovery(req: Request, res: Response){
        const formRecovery = req.body;

        
        res.json({message:"Response recovery", status:202});
    }

    public restore(req: Request, res: Response){
        const formRestore = req.body;
        res.json({message:"Response recovery", status:202});
    }

    public async dependenciesUser(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        //console.log(bdmysql);
        const dependenciasUsuario = await db.query(`SELECT * FROM ${bdmysql}.dependencies_user WHERE codusersap = '${infoUsuario.codusersap}'`);

        //console.log(dependenciasUsuario);
        res.json(dependenciasUsuario);
    }

    public async areasSolpedUser(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        //console.log(bdmysql);
        const dependenciasUsuario = await db.query(`SELECT * FROM ${bdmysql}.areas_user WHERE codusersap = '${infoUsuario.codusersap}'`);

        //console.log(dependenciasUsuario);
        res.json(dependenciasUsuario);
    }

    public async almacenUser(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        //console.log(bdmysql);
        const dependenciasUsuario = await db.query(`SELECT * FROM ${bdmysql}.stores_users WHERE codusersap = '${infoUsuario.codusersap}'`);

        //console.log(dependenciasUsuario);
        res.json(dependenciasUsuario);
    }

    public async almacenUserXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const bdmysql = infoUsuario.bdmysql;
        const compania = infoUsuario.dbcompanysap;
       
        
        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAlmacenXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
        console.log(url2);
        const response2 = await fetch(url2);
        //console.log(response2.body); 
        const data2 = await response2.json();  

        console.log(data2); 

        
        
        return res.json(data2);  
    }

    public async dependenciesUserXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;


        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
        console.log(url2);
        const response2 = await fetch(url2);
        //console.log(response2.body); 
        const data2 = await response2.json();  

        console.log(data2); 

        
        
        return res.json(data2); 
    }

    public async areasUserXE(req: Request, res: Response) {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken:DecodeTokenInterface = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario:InfoUsuario = decodedToken.infoUsuario;
        const compania = infoUsuario.dbcompanysap;


        const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAreasSolpedXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
        console.log(url2);
        const response2 = await fetch(url2);
        //console.log(response2.body); 
        const data2 = await response2.json();  

        console.log(data2); 

        
        
        return res.json(data2); 
    }

}

const authController = new AuthController();

export default authController;