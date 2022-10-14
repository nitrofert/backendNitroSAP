
import { Router } from "express";

import menuController from "../controllers/menuController";


class MenuRoutes{
    public router: Router = Router();

    constructor(){
        console.log('menu routes');
        this.config();
    }

    config():void{
        this.router.get('/list',menuController.list);
        this.router.get('/listFather',menuController.listFather );
        this.router.get('/orderNum/:hierarchy/:iddad?',menuController.orderNum );
        this.router.post('/',menuController.create);
        this.router.get('/:id',menuController.getMenuById); 
        this.router.put('/',menuController.update); 
        this.router.delete('/:id',menuController.delete);
    }
}

const menuRoutes = new MenuRoutes();
export default menuRoutes.router;