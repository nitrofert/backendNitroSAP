import {  NextFunction, Request, Response } from "express";
import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import  helper  from "../lib/helpers";
import jwt, { SignOptions } from 'jsonwebtoken';
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import fetch from 'node-fetch';


class AuthController{


    public async recaptcha(req: Request, res: Response){
        
        const { token, tipoCaptcha} = req.body;
        let urlVerify = "https://www.google.com/recaptcha/api/siteverify";
        let secret_key_captcha = "";
        let secret_key_captchaV2 = "";
        //let token = "6Ldo6BMkAAAAABUAduK9ZiDox7o8tE7RjWoRaMtQ"; 
        /*
        console.log('recaptcha');
        let payload = {
            'secret': secret_key_captcha,
            'response':token,
            //'headers': { "Content-Type": "application/x-www-form-urlencoded" },
            //'remoteop': req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
        console.log(payload);  
        let result = await fetch(urlVerify, {method: 'POST', body:new URLSearchParams(Object.entries(payload)).toString()});
        let data = await result.json();
        console.log(data);  
       */

        const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
        let secret ="";
        if(tipoCaptcha=='v2'){
            secret = secret_key_captchaV2;
        }

        if(tipoCaptcha=='v3'){
            secret = secret_key_captcha;
        }

        return fetch(VERIFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${secret}&response=${token}`,
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);  
          //res.locals.recaptcha = data;
          return res.json(data);
        });

       
    }


    public async login(req: Request, res: Response){
        
        //Recibe los campos del formulario Login y lo alamacenamos en una constante formLogin
        const formLogin = {
            username: req.body.username,
            password: await helper.encryptPassword(req.body.password),
            company: req.body.company
        }
        //Consultamos la tabla de usuarios con el nombre de usuario proporcionado en el formulario
        const  user:any[] =  await db.query(`
        
            SELECT t0.id, t0.username,t0.password, t0.fullname, t0.status, t1.id_company as companyid ,t2.companyname,  t2.urlwsmysql AS bdmysql, t2.dbcompanysap 
            FROM users t0 
            INNER JOIN company_users t1 ON t1.id_user = t0.id
            INNER JOIN companies t2 ON t2.id = t1.id_company
            WHERE (t0.username = ? or t0.email = ?) and t1.id_company = ?`
            ,[formLogin.username,formLogin.username,formLogin.company]);

        // Validamos si el usuario buscado por el username existe, si no existe retornamos error
        if(user.length==0) return res.status(401).json({message:"Datos de inicio de sesión invalidos", status:401});

        //Comparamos el pasword registrado en el formulario con el password obtenido del query x username
        const validPassword = await helper.matchPassword(req.body.password, (user[0].password || ''));

        // Si el passwornno coincide, retornamos error 
        if(!validPassword) return res.status(401).json({message:"Datos de inicio de sesión invalidos", status:401});
        
        //Validar estado del usuario
        if(user[0].status=='I') return res.status(401).json({message:"Usuario inactivo", status:401});

        //Obtener datos de usuario para ecriptar en token jwt
        const tokenid:string = await helper.generateToken({userId:user[0].id, company:user[0].companyid});
        const token:string = tokenid;

        //Regstrar log
        await helper.logaccion(user[0],`El usuario ${formLogin.username} ha accedido al portal`);

        //Retorno de respuesta exitosa y datos del usuario logueado o token
        return res.json({message:`Bienvenid@ ${user[0].fullname}`, status:200,token,tokenid});
    } 

    public async validarusuario(req: Request, res: Response){
        
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
               id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap ,nit,direccion,telefono 
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`,[user[0].id,user[0].companyid]);
        
        
        const userId:number = infoUsuario[0].id;
        const company:string = infoUsuario[0].id_company;
       
        //const token:string = await helper.generateToken(userConfig);

        const tokenid:string = await helper.generateToken({userId, company});
        const token:string = tokenid;

        //Regstrar log
        await helper.logaccion(infoUsuario[0],`El usuario ${formLogin.username} ha accedido al portal`);
        //return res.json({message:`!Bienvenido ${userConfig.infoUsuario.fullname}¡`, status:200,infoUsuario,tokenid});
        return res.json({message:`Bienvenid@ ${infoUsuario[0].fullname}`, status:200,infoUsuario,token,tokenid});
    } 

    public async configUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            const perfilesUsuario = await helper.getPerfilesUsuario(decodedToken.userId);
            const menuUsuario = await helper.getMenuUsuario(decodedToken.userId);
            const permisosUsuario = await helper.getPermisoUsuario(decodedToken.userId);

            const configUsuario:any = {
                infoUsuario,
                perfilesUsuario,
                menuUsuario,
                permisosUsuario
            }
            return res.json(configUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async infoUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            return res.json(infoUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async logo64(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const logo64 = await helper.getLogo64(decodedToken.userId, decodedToken.company);
            //console.log(logo64[0].logobase64);
            const buffer = Buffer.from(logo64[0].logobase64);
            //console.log(buffer.toString())
            return res.json(buffer.toString());

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async logout(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            console.log(decodedToken);
            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId, decodedToken.company);
            let result = await helper.logaccion(infoUsuario[0],`El usuario ${infoUsuario[0].username} ha salido del portal`);
            console.log(result);
            return res.json(infoUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async perfilesUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const perfilesUsuario = await helper.getPerfilesUsuario(decodedToken.userId);
            return res.json(perfilesUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async menuUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const menuUsuario = await helper.getMenuUsuario(decodedToken.userId);
            return res.json(menuUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    } 

    public async permisosUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //console.log(decodedToken);
            const permisosUsuario = await helper.getPermisoUsuario(decodedToken.userId);
            return res.json(permisosUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async empresasUsuario(req: Request, res: Response) {
        try { 

            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            console.log(decodedToken);
            const empresasUsuario = await helper.getEmpresasUsuario(decodedToken.userId);
            return res.json(empresasUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

   

    public async actulizarInfoUsuario(req: Request, res: Response){
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization;
        if(jwt){
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        }   
        //******************************************************* */
        

         
            
                const user = req.body;
                console.log(user);
                const idUser = user.id;
                const newUser:any = {
                    fullname: user.fullname,
                    email: user.email,
                }
                if(user.password){
                    user.password = await helper.encryptPassword(user.password ||'');
                    newUser.password = user.password;
                } 

                console.log(user);

                const result = await db.query('update users set ? where id = ?', [newUser,idUser]);
                console.log(result);
                res.json(result);
           

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }

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
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */
        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        const query = `SELECT * 
        FROM dependencies_user t0
        INNER JOIN companies t1 ON t1.id = t0.companyid 
        WHERE t0.codusersap = '${infoUsuario[0].codusersap}' and 
              t1.urlwsmysql = '${bdmysql}' and
              t1.status = 'A'`;

        //console.log(query);      
        const dependenciasUsuario = await db.query(query);
        //console.log(dependenciasUsuario);
        res.json(dependenciasUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async areasSolpedUser(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        

        

            const dependenciasUsuario = await db.query(`SELECT * FROM ${bdmysql}.areas_user WHERE codusersap = '${infoUsuario[0].codusersap}'`);
            res.json(dependenciasUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async almacenUser(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const bdmysql = infoUsuario[0].bdmysql;
        

        

            const dependenciasUsuario = await db.query(`SELECT * FROM ${bdmysql}.stores_users WHERE codusersap = '${infoUsuario[0].codusersap}'`);
            res.json(dependenciasUsuario);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async almacenUserXE(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;
       
        
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAlmacenXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`;
        console.log(url2);

            const response2 = await fetch(url2);
            const data2 = await response2.json();  
            return res.json(data2); 

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async dependenciesUserXE(req: Request, res: Response) {
        try {

        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;


        //const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`;
        //const url2 = `http://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:8000/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`;
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`; 
        console.log(url2);
        //https://nitrofert-hbt.heinsohncloud.com.co:4300/

        
       

            const response2 = await fetch(url2);
            const data2 = await response2.json();  
            //console.log(data2);
            return res.json(data2); 

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async areasUserXE(req: Request, res: Response) {
        try {
        //Obtener datos del usurio logueado que realizo la petición
        let jwt = req.headers.authorization || '';
        jwt = jwt.slice('bearer'.length).trim();
        const decodedToken = await helper.validateToken(jwt);
       
        //******************************************************* */

        const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
        const compania = infoUsuario[0].dbcompanysap;


        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAreasSolpedXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`;
        console.log(url2);
        

            const response2 = await fetch(url2);
            const data2 = await response2.json();  
            return res.json(data2); 

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
        
    }

    public async areasUser(req: Request, res: Response) {
        try {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);
        
            //******************************************************* */

            const infoUsuario = await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const compania = infoUsuario[0].dbcompanysap;
            const bdmysql = infoUsuario[0].bdmysql;


            /*const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAreasSolpedXUsuario.xsjs?usuario=${infoUsuario[0].codusersap}&compania=${compania}`;
            console.log(url2);
            const response2 = await fetch(url2);
            const data2 = await response2.json();  
            return res.json(data2);*/ 

            const areas = await db.query(`Select * 
                                          From areas_user t0 
                                          INNER JOIN companies t1 ON t0.companyid = t1.id
                                          where t1.status ='A' and
                                                t1.urlwsmysql = '${bdmysql}' and
                                                T0.codusersap = '${infoUsuario[0].codusersap}'`);

            return res.json(areas);

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
        
    }
   


  

}

const authController = new AuthController();

export default authController;