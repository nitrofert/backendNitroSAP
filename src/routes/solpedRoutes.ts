import { Router } from "express";
import solpedController  from "../controllers/solpedController";
import multer from '../lib/multer';

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
        this.router.get('/aprobar/:idcrypt',solpedController.aprovedMail);  
        this.router.get('/rechazar/:idcrypt',solpedController.reject);
        this.router.put('/rechazar',solpedController.rejectSolped);
        this.router.post('/aprobacion',solpedController.aproved_portal);
        this.router.get('/aprobaciones/:id',solpedController.listAprobaciones);  
        this.router.post('/cancelacion',solpedController.cancelacionSolped);
        this.router.post('/upload', multer.single('myFile'), solpedController.uploadAnexoSolped);
        this.router.post('/borraranexo', solpedController.borrarAnexoSolped);
        this.router.post('/download', solpedController.downloadAnexoSolped);
        this.router.get('/list/mp', solpedController.listMP);
        this.router.get('/list/mps/:status', solpedController.listMPS2);
        this.router.get('/list/ocmp/:status', solpedController.listOCMP);
        this.router.get('/list/inmp', solpedController.listInMP);
        this.router.post('/mp', solpedController.createMP);
        this.router.put('/mp', solpedController.updateMP);
        this.router.post('/enviar-sap',solpedController.enviarSolpedSAP);
        this.router.put('/enviar-sap',solpedController.actualizarSolpedSAP);
        this.router.put('/enviar-sap-pedido',solpedController.actualizarPedidoSAP);

    }
}

const solpedRoutes = new SolpedRoutes();
export default solpedRoutes.router;