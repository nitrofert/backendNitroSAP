import { Router } from "express";

import reportesController  from "../controllers/reportesController";

class ReportesRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.post('/evaluacionProveedores', reportesController.evaluacionProveedores);
        this.router.post('/detalleEntradasProveedor', reportesController.detalleEntradasProveedor);
        
        
        /*this.router.put('/', entradaController.update);
         
        this.router.post('/envio-aprobacion',entradaController.envioAprobacionSolped);
        this.router.get('/aprobar/:idcrypt',entradaController.aprovedMail);  
        this.router.get('/rechazar/:idcrypt',entradaController.reject);
        this.router.put('/rechazar',entradaController.rejectSolped);
        this.router.post('/aprobacion',entradaController.aproved_portal);
        this.router.get('/aprobaciones/:id',entradaController.listAprobaciones);  
        this.router.post('/cancelacion',entradaController.cancelacionSolped);*/

    }
}

const reportesRoutes = new ReportesRoutes();
export default reportesRoutes.router;