
import { Router } from "express";

import configController from "../controllers/configController";


class ConfigRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/menu/:id',configController.list);
        
    }
}

const configRoutes = new ConfigRoutes();
export default configRoutes.router;