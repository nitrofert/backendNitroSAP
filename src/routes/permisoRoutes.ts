
import { Router } from "express";

import permisoController from "../controllers/permisoController";


class PermisoRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list',permisoController.list);
        this.router.get('/:id',permisoController.getById);
        this.router.post('/',permisoController.create);
        this.router.put('/',permisoController.update);
        this.router.delete('/:id',permisoController.delete);
        
    }
}

const permisoRoutes = new PermisoRoutes();
export default permisoRoutes.router;