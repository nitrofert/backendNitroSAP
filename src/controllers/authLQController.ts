import { Request, Response } from "express";
import {db} from "../database";
import { UserInterface } from "../interfaces/user.interface";
import  helper  from "../lib/helpers";
import jwt, { SignOptions } from 'jsonwebtoken';
import { DecodeTokenInterface, InfoUsuario } from "../interfaces/decodedToken.interface";
import fetch from 'node-fetch';


class AuthLQController{


    public async titulos(req: Request, res: Response){

        try {

        
        const infoLog = await helper.loginWsLQ();
        console.log(infoLog.data.access_token);

        
        
        //const titulos = await helper.getTitulosLQ(infoLog.data.access_token);
        let dataNewTitulo!:any ;
        let dataUpdateTitulo!:any ;
        let nextPage:any = `https://app.liquitech.co/api_urls/app_operaciones/titulos_negociacion/`;
        let titulos:any[] = [];
        let titulosUpdate:any[] = [];
        let titulosPage:any;
        let no_titulo:any;
        let tituloSap:any;
        let resultInsertTitulo:any;
        let resultUpdateTitulo:any;
        
        //console.log(titulos.length,titulos.length); 

        let fechaEjecucion = new Date();

        while(nextPage!=null){
             console.log(nextPage);
             titulosPage = await helper.getTitulosLQ(infoLog.data.access_token,nextPage);
             
             console.log(titulosPage);

             if(titulosPage.results){
                for(let titulo of titulosPage.results){
                    no_titulo = titulo.no_titulo;
                    tituloSap = await helper.getTituloById(no_titulo);
                    //console.log(titulo);
                    if(tituloSap.value.length==0){
                        //Insertar factura en udo
                       
                        let nit_pagador_sap = await helper.getNitProveedorByTitulo(no_titulo);
                        
                        dataNewTitulo = {
                            U_NIT:nit_pagador_sap.value[0].BusinessPartners.FederalTaxID,
                            U_FECHA_FACT: titulo.fecha_emision,
                            U_TOTAL:titulo.valor_titulo,
                            U_FACTURA:titulo.no_titulo,
                            U_NF_ESTADO_APROBADO: titulo.estado=='aprobado'?'SI':'NO',
                            U_NF_ESTADO_DESEMBOLSADO: titulo.estado=='desembolsado'?'SI':'NO',
                            U_NF_ESTADO_ABONADO: titulo.estado=='abonado'?'SI':'NO',
                            U_NF_ESTADO_PAGADO: titulo.estado=='pagado'?'SI':'NO',
                            U_NF_CUFE_FV:titulo.cufe,
                            U_NF_FECHA_PAGO:titulo.fecha_pago,
                            U_NF_FECHA_NEGOCIACION:titulo.fecha_negociacion,
                            U_NF_VALOR_GIRO:titulo.valor_giro
                        }
    
                        resultInsertTitulo = await helper.InsertTituloSL(dataNewTitulo);
    
                        titulos.push(titulo)
        
                    }else{
                        //Update estado cabecera titulo
                        dataUpdateTitulo={
                            U_NF_ESTADO_APROBADO: titulo.estado=='aprobado'?'SI':'NO',
                            U_NF_ESTADO_DESEMBOLSADO: titulo.estado=='desembolsado'?'SI':'NO',
                            U_NF_ESTADO_ABONADO: titulo.estado=='abonado'?'SI':'NO',
                            U_NF_ESTADO_PAGADO: titulo.estado=='pagado'?'SI':'NO',
                            U_NF_CUFE_FV:titulo.cufe,
                            U_NF_FECHA_PAGO:titulo.fecha_pago,
                            U_NF_FECHA_NEGOCIACION:titulo.fecha_negociacion,
                            U_NF_VALOR_GIRO:titulo.valor_giro
                        };
    
                        resultUpdateTitulo = await helper.UpdateTituloSL(dataUpdateTitulo,tituloSap.value[0].DocEntry);
                        //console.log(resultUpdateTitulo);
    
                        titulosUpdate.push(titulo);
                    }
                 }
    
                 nextPage = titulosPage.next;
             }else{
                nextPage=null;
             }
             
        }

        let fechaFinalizacion = new Date();


        //Envio Notificcación registros 
        
        let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
                    <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>`;

        if(titulos.length>0){
            html = html+`<h4>Títulos registrados</h4><br>${JSON.stringify(titulos)}<br>`;
        }

        if(titulosUpdate.length>0){
            html = html+`<h4>Títulos actualizados</h4><br>${JSON.stringify(titulosUpdate)}<br>`;
        }

        if(titulos.length == titulosUpdate.length && titulosUpdate.length ==0){
            html = html+`<h4>No se encontraron títulos a registrar</h4><br>`;
        }

        let infoEmail:any = {
            //to: LineAprovedSolped.aprobador.email,
            to:'ralbor@nitrofert.com.co',
            cc:'aballesteros@nitrofert.com.co',
            subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
            html
        }
        //Envio de notificación al siguiente aprobador con copia al autor
        await helper.sendNotification(infoEmail);
       

        res.json({'Titulos registrados':titulos,'Titulos actualizados':titulosUpdate}); 

        }catch (error: any) {
            console.error(error);
            let infoEmail:any = {
                //to: LineAprovedSolped.aprobador.email,
                to:'ralbor@nitrofert.com.co',
                cc:'aballesteros@nitrofert.com.co',
                subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
                html:error
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            return res.json(error);
        }
    } 

    public async pagos(req: Request, res: Response){

        try {
        
        const infoLog = await helper.loginWsLQ();
        //console.log(infoLog.data.access_token);
        let fechaEjecucion = new Date();
        
        
        let fechaFinPago = new Date();
        let fechaFinPagoFormat = `${fechaFinPago.getFullYear()}-${fechaFinPago.getMonth()+1}-${fechaFinPago.getUTCDate()}` ;
        let fechaInicioPago = await helper.sumarDiasFecha(new Date(),-100);
        let fechaInicioPagoFormat = `${fechaInicioPago.getFullYear()}-${fechaInicioPago.getMonth()+1}-${fechaInicioPago.getUTCDate()}` ;
        console.log(fechaFinPagoFormat,fechaInicioPagoFormat);

        //?fecha_pago_i=2022-09-01&fecha_pago_f=2022-11-30

        let nextPage:any = `https://app.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/?fecha_pago_i=${fechaInicioPagoFormat}&fecha_pago_f=${fechaFinPagoFormat}`;
    
        //let nextPage:any = `https://dev.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/`;
        console.log(nextPage); 
        let pagos:any[] = [];
        let pagosPage:any;
        let refPago:any;
        let dataNewPago:any;
        let tituloSap:any;
        let pagosTitulo:any[];
        let DocEntry:any;

        while(nextPage!=null){
            console.log(nextPage);
            pagosPage = await helper.getPagosLQ(infoLog.data.access_token,nextPage);
            console.log(pagosPage);
            if(pagosPage.results){
                for(let pago of pagosPage.results){
                    //console.log(pago);
                    
                    if(pago.valor_pagado!=0 && pago.referencia_pago!=''){
                        //Buscar titulo en SAP
                        tituloSap = await helper.getTituloById(pago.no_titulo);
                        if(tituloSap.value.length>0){
                            
                            //console.log(tituloSap);
                            pagosTitulo = tituloSap.value[0].NF_CXC_LIQUITEC_DETCollection;
                            DocEntry = tituloSap.value[0].DocEntry;
    
                            dataNewPago ={
                                
                                "U_NF_SALDO_LIQUITECH":pago.saldo_favor,
                                "NF_CXC_LIQUITEC_DETCollection": [
                                    {
                                        "U_FECHA_PAGO": pago.fecha_pago,
                                        "U_VALOR_PAGO": pago.valor_pagado,
                                        "U_NF_REF_PAGO":pago.referencia_pago
                                    }
                                ]
                            
                            };
    
    
                            if(pagosTitulo.length==0 ||  pagosTitulo.filter(item =>item.U_NF_REF_PAGO==pago.referencia_pago).length==0){
                                console.log(dataNewPago);
                                //Insertar pago a titulo
                                await helper.UpdateTituloSL(dataNewPago,DocEntry);
                                pagos.push(pago);
                            }
    
                        }
                      
                    }
                }
    
                nextPage = pagosPage.next===undefined?null:pagosPage.next;
            }else{
                nextPage=null;
            }
            
        }
         
        let fechaFinalizacion = new Date();
        let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
        <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>
        <h4>Fecha de incio pagos:</h4> ${fechaInicioPago.toLocaleDateString().toString()}<br>
        <h4>Fecha de fin pagos:</h4> ${fechaFinPago.toLocaleDateString().toString()}<br>`;

        if(pagos.length>0){
        html = html+`<h4>Pagos registrados</h4><br>${JSON.stringify(pagos)}<br>`;
        }else{
            html = html+`<h4>No se encontraron pagos a registrar</h4><br>`;
        }

       

        let infoEmail:any = {
        //to: LineAprovedSolped.aprobador.email,
        to:'ralbor@nitrofert.com.co',
        cc:'aballesteros@nitrofert.com.co',
        subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
        html
        }
        //Envio de notificación al siguiente aprobador con copia al autor
        await helper.sendNotification(infoEmail);


        res.json(pagos);
        

        }catch (error: any) {
            console.error(error);
            let infoEmail:any = {
                //to: LineAprovedSolped.aprobador.email,
                to:'ralbor@nitrofert.com.co',
                cc:'aballesteros@nitrofert.com.co',
                subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
                html:error
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            return res.json(error);
        }
        
    } 

    public async titulosYpagos(req: Request, res: Response){

        try {

        
        const infoLog = await helper.loginWsLQ();
        console.log(infoLog.data.access_token);

        
        let result_titulos = await helper.cunsumirTitulosLQ(infoLog.data.access_token);
        let result_pagos = await helper.cunsumirPagosLQ(infoLog.data.access_token);
        

        res.json({result_titulos,result_pagos});
        

        }catch (error: any) {
            console.error(error);
            let infoEmail:any = {
                //to: LineAprovedSolped.aprobador.email,
                to:'ralbor@nitrofert.com.co',
                cc:'aballesteros@nitrofert.com.co',
                subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
                html:error
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            return res.json(error);
        }
    } 


  

}

const authLQController = new AuthLQController();

export default authLQController;