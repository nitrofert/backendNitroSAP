
import { Router } from "express";

import perfilController from "../controllers/perfilController";


class PerfilRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list',perfilController.list);
        this.router.post('/',perfilController.create);
        this.router.get('/:id',perfilController.getPerfilById); 
        this.router.put('/',perfilController.update); 
        
    }
}

const perfilRoutes = new PerfilRoutes();
export default perfilRoutes.router;