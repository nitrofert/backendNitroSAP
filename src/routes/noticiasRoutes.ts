import { Router } from "express";

import companyController  from "../controllers/companyController";
import noticiasController from "../controllers/noticiasController";

class NoticiasRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/', noticiasController.list);
        this.router.get('/activas', noticiasController.listActive);
        this.router.post('/', noticiasController.create);
        this.router.get('/:id',noticiasController.getNoticiaById); 
        this.router.put('/', noticiasController.update);
    }
}

const noticiasRoutes = new NoticiasRoutes();
export default noticiasRoutes.router;