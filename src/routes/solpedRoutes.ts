import { Router } from "express";

import solpedController  from "../controllers/solpedController";

class SolpedRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list', solpedController.list);
        this.router.post('/', solpedController.create);
        this.router.put('/', solpedController.update);
        this.router.get('/:id',solpedController.getSolpedById); 
        this.router.post('/envio-aprobacion',solpedController.envioAprobacionSolped);
        this.router.get('/aprobar/:idcrypt',solpedController.aproved);  
        this.router.get('/rechazar/:idcrypt',solpedController.reject);
        this.router.put('/rechazar',solpedController.rejectSolped);
        this.router.post('/aprobacion',solpedController.aproved_portal);
        this.router.get('/aprobaciones/:id',solpedController.listAprobaciones);  

    }
}

const solpedRoutes = new SolpedRoutes();
export default solpedRoutes.router;