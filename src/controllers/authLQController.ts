import { Request, Response } from "express";
import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import  helper  from "../lib/helpers";
import jwt, { SignOptions } from 'jsonwebtoken';
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import fetch from 'node-fetch';


class AuthLQController{


    public async titulos(req: Request, res: Response){
        
        const infoLog = await helper.loginWsLQ();
        console.log(infoLog.data.access_token);
        const titulos = await helper.getTitulosLQ(infoLog.data.access_token);
        let dataTitulo!:any ;
        
        for(let titulo of titulos.results){
            //console.log(titulo);
            let no_titulo = titulo.no_titulo;
            let tituloSap = await helper.getTituloById(no_titulo);
            console.log(tituloSap.value);

            if(tituloSap.value.length==0){
                //Insertar factura en udo
               
                let nit_pagador_sap = await helper.getNitProveedorByTitulo(no_titulo);
                console.log(nit_pagador_sap);
                //dataTitulo = {}

            }


        }

        res.json(titulos); 
    } 

    public async pagos(req: Request, res: Response){
        
        const infoLog = await helper.loginWsLQ();
        console.log(infoLog.data.access_token);
        const pagos = await helper.getPagosLQ(infoLog.data.access_token);
        res.json(pagos);
        
    } 

  

}

const authLQController = new AuthLQController();

export default authLQController;