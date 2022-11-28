import { Router } from "express";
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
        this.router.post('/presupuestosVenta', mrpController.presupuestosVenta);
        this.router.post('/maxminitemzona', mrpController.maxminItemZona);
        
    }
}

const mrpRoutes = new MrpRoutes();
export default mrpRoutes.router;