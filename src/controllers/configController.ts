import { Request, Response } from "express";

import {db} from "../database";
import { MenuInterface } from "../interfaces/menu.interface";
import { UserInterface } from "../interfaces/user.interface";
import helper from "../lib/helpers";




class ConfigController{
    
    public async list(req: Request, res: Response){
        try {
            
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

        }catch (error: any) {
            console.error(error);
                res.json(error);
        }
    }

    async loadSeriesSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){

                //objtype de la solped
                let objtype = '1470000113'
                let seriesSAP =await helper.objectToArray(await helper.getSeriesXE(company.dbcompanysap, objtype));
                
                if(seriesSAP.length>0){
                    console.log(seriesSAP);
                    //Register series Mysql
                    await helper.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                }

                //objtype de la oc
                objtype = '22'
                seriesSAP =await helper.objectToArray(await helper.getSeriesXE(company.dbcompanysap, objtype));
                
                if(seriesSAP.length>0){
                    console.log(seriesSAP);
                    //Register series Mysql
                    await helper.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                }


                //objtype de la entrada
                objtype = '20'
                seriesSAP =await helper.objectToArray(await helper.getSeriesXE(company.dbcompanysap, objtype));
                
                if(seriesSAP.length>0){
                    console.log(seriesSAP);
                    //Register series Mysql
                    await helper.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                }

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadCuentasContablesSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){

                let cuentasSAP =await helper.objectToArray(await helper.getCuentasXE(company.dbcompanysap));
                
                if(cuentasSAP.length>0){
                    console.log(cuentasSAP);
                    //Register cuentasSAP Mysql
                    await helper.registrarCuentas(cuentasSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadTaxesSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){

                let taxesSAP =await helper.objectToArray(await helper.getTaxesXE(company.dbcompanysap));
                
                if(taxesSAP.length>0){
                    console.log(taxesSAP);
                    //Register taxesSAP Mysql
                    await helper.registrarImpuestos(taxesSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadItemsSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){

                let itemsSAP =await helper.objectToArray(await helper.itemsSolpedXengine(company.dbcompanysap));
                
                if(itemsSAP.length>0){
                    //console.log(itemsSAP);
                    //Register itemsSAP Mysql
                    await helper.registrarItems(itemsSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadModelosAprobacionSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){

                let modelosSAP:any[] =await helper.objectToArray(await helper.getModelosAPXE(company.dbcompanysap));
                console.log(modelosSAP.length);
                if(modelosSAP.length>0){
                    //console.log(modelosSAP);
                    //Register modelosSAP Mysql
                    await helper.registrarModelosAP(modelosSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadProveedoresSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){


                let proveedoresSAP =await helper.objectToArray(await helper.getProveedores2XE(company.dbcompanysap));
                
                if(proveedoresSAP.length>0){
                    //console.log(proveedoresSAP);
                    //Register proveedoresSAP Mysql
                    await helper.registrarProveedores(proveedoresSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadDependenciasSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){


                let dependendciasSAP =await helper.objectToArray(await helper.getDependenciasSL(company.dbcompanysap));
                
                if(dependendciasSAP.length>0){
                    //console.log(dependendciasSAP);
                    //Register dependendciasSAP Mysql
                    await helper.registrarDependencias(dependendciasSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadCuentasDependenciasSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){


                let dependendciasSAP =await helper.objectToArray(await helper.getCuentasDependenciasSL(company.dbcompanysap));
                
                if(dependendciasSAP.length>0){
                    //console.log(dependendciasSAP);
                    //Register dependendciasSAP Mysql
                    await helper.registrarCuentasDependencias(dependendciasSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadUdoUsuariosSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);

            let usuarios:any[] = await  db.query(`Select * from users where status='A'`);

            for(let usuario of usuarios){

                for(let company of companies){
                    
                    let areasUsuario =await helper.objectToArray(await helper.getAreasUserXE(company.dbcompanysap, usuario.codusersap));
                    
                    if(areasUsuario.length>0){
                        console.log('AREAS',company.dbcompanysap,usuario.codusersap, areasUsuario);
                        //Register cuentasSAP Mysql
                        await helper.registrarAreasUsuario(areasUsuario, company.id, usuario.id);
                    }
                    
                    
                    let storesUsuario =await helper.objectToArray(await helper.getStoresUserXE(company.dbcompanysap, usuario.codusersap));
                    
                    if(storesUsuario.length>0){
                        //console.log('ALMACENES',company.dbcompanysap,usuario.codusersap, storesUsuario);
                        //Register cuentasSAP Mysql
                        await helper.registrarStoresUsuario(storesUsuario, company.id, usuario.id);
                    }
                    
                    let dependenciasUsuario =await helper.objectToArray(await helper.getDependenciasUserXE(company.dbcompanysap, usuario.codusersap));
                    
                    if(dependenciasUsuario.length>0){
                        //console.log('DEPENDENCIAS',company.dbcompanysap,usuario.codusersap, dependenciasUsuario);
                        //Register cuentasSAP Mysql
                        await helper.registrarDependenciasUsuario(dependenciasUsuario, company.id, usuario.id);
                    }
                    
    
                }
    

            }
            
           
            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadAlmacenesSapToMysql(req: Request, res: Response){

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A'`);
            
            for(let company of companies){


                let almacenesSAP =await helper.objectToArray(await helper.getAlmacenes(company.dbcompanysap));
                
                if(almacenesSAP.length>0){
                    //console.log(almacenesSAP);
                    //Register almacenesSAP Mysql
                    await helper.registrarAlmacenes(almacenesSAP, company.urlwsmysql);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    async loadTasasDeCambio(req: Request, res: Response){
        
        const { fechaTrm } = req.params;

        try {

            let companies:any[] = await db.query(`Select * from companies where status='A' and dbcompanysap='PRUEBAS_NITROFERT_PRD'`);
            
            for(let company of companies){


                let trmDia =await helper.objectToArray(await helper.getTrmDiaXE(company.dbcompanysap,fechaTrm));
                
                if(trmDia.length>0){
                    console.log(trmDia);
                    //Register dependendciasSAP Mysql
                    await helper.registrarTrmDia(trmDia,fechaTrm);
                }

             

            }

            
            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
         
    }
    

    async loadRecetasItemPT(req: Request, res: Response){
        
        

        try {

            const recetas_item_pt =  await helper.objectToArray(await helper.getItemsMPbyItemPT('NITROFERT_PRD',''));

            console.log(recetas_item_pt);

            const result = await  helper.registrarRecetasItemPT(recetas_item_pt,'nitrosap');

            console.log(result);

            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
         
    }

    

    async loadListaPreciosSAPPT(req: Request, res: Response){
        
        

        try {

            const lista_precios_sap_pt =  await helper.objectToArray(await helper.getListaPreciosItemSAP('NITROFERT_PRD',''));

            console.log(lista_precios_sap_pt);

            const result = await  helper.registrarListaPreciosSAPPT(lista_precios_sap_pt,'nitrosap');

            console.log(result);

            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
         
    }


    

    async loadListaPrecioVentasSAP(req: Request, res: Response){
        
        

        try {

            let fechaFin = new Date();
            let fechaInicio = await helper.sumarDias(fechaFin,-14);

            const lista_precios_venta =  await helper.objectToArray(await helper.getPrecioVentaItemSAP2('NITROFERT_PRD','', fechaInicio.toISOString(), fechaFin.toISOString()));

            console.log(lista_precios_venta);

            const result = await  helper.registrarListaPrecioVentaSAP(lista_precios_venta,'nitrosap');

            console.log(result);

            res.json({ok:'ok'});


        
        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
         
    }
}

const configController = new ConfigController();
export default configController;