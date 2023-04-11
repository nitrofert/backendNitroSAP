
import { Router } from "express";

import configController from "../controllers/configController";


class ConfigRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/menu/:id',configController.list);
        this.router.get('/series',configController.loadSeriesSapToMysql);
        this.router.get('/impuestos',configController.loadTaxesSapToMysql);
        this.router.get('/items',configController.loadItemsSapToMysql);
        this.router.get('/almacenes',configController.loadAlmacenesSapToMysql);
        this.router.get('/cuentas-contable',configController.loadCuentasContablesSapToMysql);
        this.router.get('/modelos-aprobacion',configController.loadModelosAprobacionSapToMysql);
        this.router.get('/proveedores',configController.loadProveedoresSapToMysql);
        this.router.get('/udo-usuarios',configController.loadUdoUsuariosSapToMysql);
        this.router.get('/udo-dependencias',configController.loadDependenciasSapToMysql);
        this.router.get('/udo-cuentas-dependencias',configController.loadCuentasDependenciasSapToMysql);
        this.router.get('/tasa-cambio/:fechaTrm',configController.loadTasasDeCambio);
        
        
    }
}

const configRoutes = new ConfigRoutes();
export default configRoutes.router;