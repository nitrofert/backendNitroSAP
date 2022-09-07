import { Router } from "express";

import wssapController  from "../controllers/wssapController";

class WsSAPRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/BusinessPartners', wssapController.BusinessPartners);
        this.router.get('/Items', wssapController.Items);
        this.router.get('/Cuentas', wssapController.Cuentas);
        this.router.get('/Xengine/items', wssapController.itemsXengine);
       
    }
}

const wssapRoutes = new WsSAPRoutes();
export default wssapRoutes.router;