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
        this.router.get('/Xengine/cuentas', wssapController.CuentasXE);
        this.router.get('/Xengine/series/:objtype?', wssapController.SeriesXE);
        this.router.get('/Xengine/ordenes-open-usuario', wssapController.OrdenesUsuarioXE);
        this.router.get('/Xengine/ordenes-open-usuario-sl', wssapController.OrdenesUsuarioSL);
        this.router.get('/Xengine/pedido/:pedido', wssapController.PedidoByIdSL);


       
    }
}

const wssapRoutes = new WsSAPRoutes();
export default wssapRoutes.router;