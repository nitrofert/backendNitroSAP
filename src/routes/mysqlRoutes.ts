import { Router } from "express";
import mysqlQueriesController from "../controllers/mysqlController";
import multer from '../lib/multer';

class MySQLRoutes{
    public router: Router = Router();

    

    constructor(){
        this.config();
    }

     

    config():void{
        
        this.router.get('/load-config-solped', mysqlQueriesController.configSolped);
        this.router.get('/load-config-solped-mp', mysqlQueriesController.configSolpedMP);
        this.router.get('/series/:objtype?', mysqlQueriesController.series);
        this.router.get('/cuentas', mysqlQueriesController.cuentas);
        this.router.get('/impuestos-compra', mysqlQueriesController.impuestosCompra);
        this.router.get('/items', mysqlQueriesController.items); 
        this.router.get('/items-calculadora', mysqlQueriesController.itemsCalculadora); 
        this.router.get('/items-mp', mysqlQueriesController.itemsMP); 
        this.router.get('/almacenes', mysqlQueriesController.almacenes); 
        this.router.get('/zonas', mysqlQueriesController.zonas); 
        this.router.get('/monedas', mysqlQueriesController.monedas); 
        this.router.get('/socios-negocio', mysqlQueriesController.sociosNegocio);
        this.router.get('/areas-usuario', mysqlQueriesController.areasUsuario);
        this.router.get('/dependencias-usuario', mysqlQueriesController.dependeciasUsuario);
        this.router.get('/almacenes-usuario', mysqlQueriesController.almacenesUsuario);
        this.router.get('/cuentas-dependencia/:dependencia?', mysqlQueriesController.cuentasDependencia);
        
        
        
        
        
       
        

    }
}

const mysqlRoutes = new MySQLRoutes();
export default mysqlRoutes.router;