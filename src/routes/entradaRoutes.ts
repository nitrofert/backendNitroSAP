import { Router } from "express";

import entradaController  from "../controllers/entradaController";

class EntradaRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list', entradaController.list);
        this.router.post('/', entradaController.create);
        this.router.get('/:id',entradaController.getEntradaById);
        this.router.get('/impresion/:id',entradaController.getEntradaByIdSL);
        this.router.patch('/cancel/:id', entradaController.cancel);
        this.router.get('/pedido/:id', entradaController.entradasByPedido);
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

const entradaRoutes = new EntradaRoutes();
export default entradaRoutes.router;