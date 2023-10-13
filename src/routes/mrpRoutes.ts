import { Router } from "express";
import multer from '../lib/multer';
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
        this.router.post('/presupuestosVenta', mrpController.presupuestosVentaItem);
        this.router.get('/presupuestosVenta', mrpController.presupuestosVenta);
        this.router.post('/maxminitemzona', mrpController.maxminItemZona);
        this.router.get('/maxminitemzona', mrpController.maxmin);
        this.router.post('/carguepresupuesto', mrpController.cargarPresupuesto);
        this.router.post('/carguemaxmin', mrpController.cargarMaxMin);
        this.router.post('/carguepresupuesto2', multer.single('myFile'), mrpController.cargarPresupuesto2);
        this.router.post('/grabarSimulaciones', mrpController.grabarSimulaciones);
        this.router.post('/lista-precios-mp', mrpController.grabarListaPreciosMP);
        this.router.get('/lista-precios-mp', mrpController.getListaPreciosMP);
        this.router.get('/lista-precios-mp/:semana', mrpController.getListaPreciosMPSemana);
        this.router.post('/lista-precios-pt', mrpController.grabarListaPreciosPT);
        this.router.get('/lista-precios-pt', mrpController.getListaPreciosPT);
        this.router.get('/lista-precios-sugeridos', mrpController.getListaPreciosSugeridos);
        this.router.get('/lista-precios-sugeridos/:item', mrpController.getListaPreciosSugeridosItem);
        this.router.get('/lista-precios-pt/:semana', mrpController.getListaPreciosPTSemana);
        this.router.get('/lista-precios-pt-seman-zona', mrpController.getPreciosPTxSemanaZonaAutor);
        this.router.get('/lista-precios-item/:itemcode', mrpController.getListaPreciosItemSap);
        this.router.get('/items-mp-by-item-pt/:itemcode', mrpController.getItemsMPbyItemPT);
        this.router.get('/precio-mp-item-ultimas-semanas', mrpController.getPreciosMPItemUltimasSemanas);
        this.router.get('/precio-mercado-item-semana', mrpController.getPrecioMercadoItemSemana);
        this.router.post('/actualizar-parametros-calculadora', mrpController.updateParametrosCalc);
        this.router.get('/parametros-mp-calculadora', mrpController.getParametrosMP);
        this.router.post('/nuevo-autor', mrpController.nuevoAutor);
        this.router.post('/cargar-lp-mercado', multer.single('myFileLP'), mrpController.cargarLPMercado);
        this.router.post('/cargar-lp-mp', multer.single('myFileMP'), mrpController.cargarLPMP);
        this.router.post('/cargar-lp-sugerido', multer.single('myFileLPSugerido'), mrpController.cargarLPSugerido);
        this.router.post('/grabar-calculo-precios-item',  mrpController.grabarCalculoPreciosItem);
        this.router.post('/anular-calculo-precios-item',  mrpController.anularCalculoPreciosItem);
        
        this.router.get('/consulta-calculos-item', mrpController.getInfoCalculoItem);
        this.router.get('/precio-venta-item', mrpController.getPrecioVentaItemSAP);
       
       
        
        
        
        
    }
}

const mrpRoutes = new MrpRoutes();
export default mrpRoutes.router;