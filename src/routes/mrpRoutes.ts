import { Router } from "express";
import multer from '../lib/multer';
import mrpController from "../controllers/mrpController";


class MrpRoutes{
    public router: Router = Router();

    

    constructor(){
        this.config();
    }

    

    config():void{
        this.router.get('/zonas', mrpController.zonas);
        this.router.post('/inventarios', mrpController.inventarios);
        this.router.post('/inventariosTracking', mrpController.inventariosTracking);
        this.router.post('/presupuestosVenta', mrpController.presupuestosVentaItem);
        this.router.get('/presupuestosVenta', mrpController.presupuestosVenta);
        this.router.post('/maxminitemzona', mrpController.maxminItemZona);
        this.router.get('/maxminitemzona', mrpController.maxmin);
        this.router.post('/carguepresupuesto', mrpController.cargarPresupuesto);
        this.router.post('/carguemaxmin', mrpController.cargarMaxMin);
        this.router.post('/carguepresupuesto2', multer.single('myFile'), mrpController.cargarPresupuesto2);
        this.router.post('/grabarSimulaciones', mrpController.grabarSimulaciones);
        
    }
}

const mrpRoutes = new MrpRoutes();
export default mrpRoutes.router;