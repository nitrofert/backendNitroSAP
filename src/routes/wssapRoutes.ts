import { Router } from "express";

import wssapController  from "../controllers/wssapController";

class WsSAPRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/BusinessPartners', wssapController.BusinessPartners);
        this.router.get('/BusinessPartnersXE/:id?', wssapController.BusinessPartnersXE);
        this.router.get('/Items', wssapController.Items);
        this.router.get('/Cuentas', wssapController.Cuentas);
        this.router.get('/Xengine/items', wssapController.itemsXengine);
        this.router.get('/Xengine/monedas/:fechaTrm', wssapController.monedasXengine);
        this.router.get('/Xengine/aprobaciones', wssapController.AprobacionesXE);
       
    }
}

const wssapRoutes = new WsSAPRoutes();
export default wssapRoutes.router;