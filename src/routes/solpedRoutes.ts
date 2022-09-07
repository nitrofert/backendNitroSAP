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
        this.router.get('/:id',solpedController.getSolpedById); 
        this.router.put('/', solpedController.update);
    }
}

const solpedRoutes = new SolpedRoutes();
export default solpedRoutes.router;