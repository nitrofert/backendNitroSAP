"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../lib/multer"));
const mrpController_1 = __importDefault(require("../controllers/mrpController"));
class MrpRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/zonas', mrpController_1.default.zonas);
        this.router.post('/inventarios', mrpController_1.default.inventarios);
        this.router.post('/inventariosTracking', mrpController_1.default.inventariosTracking);
        this.router.post('/presupuestosVenta', mrpController_1.default.presupuestosVentaItem);
        this.router.get('/presupuestosVenta', mrpController_1.default.presupuestosVenta);
        this.router.post('/maxminitemzona', mrpController_1.default.maxminItemZona);
        this.router.get('/maxminitemzona', mrpController_1.default.maxmin);
        this.router.post('/carguepresupuesto', mrpController_1.default.cargarPresupuesto);
        this.router.post('/carguemaxmin', mrpController_1.default.cargarMaxMin);
        this.router.post('/carguepresupuesto2', multer_1.default.single('myFile'), mrpController_1.default.cargarPresupuesto2);
        this.router.post('/grabarSimulaciones', mrpController_1.default.grabarSimulaciones);
        this.router.post('/lista-precios-mp', mrpController_1.default.grabarListaPreciosMP);
        this.router.get('/lista-precios-mp', mrpController_1.default.getListaPreciosMP);
        this.router.get('/lista-precios-mp/:semana', mrpController_1.default.getListaPreciosMPSemana);
        this.router.post('/lista-precios-pt', mrpController_1.default.grabarListaPreciosPT);
        this.router.get('/lista-precios-pt', mrpController_1.default.getListaPreciosPT);
        this.router.get('/lista-precios-sugeridos', mrpController_1.default.getListaPreciosSugeridos);
        this.router.get('/lista-precios-sugeridos/:item', mrpController_1.default.getListaPreciosSugeridosItem);
        this.router.get('/lista-precios-pt/:semana', mrpController_1.default.getListaPreciosPTSemana);
        this.router.get('/lista-precios-pt-seman-zona', mrpController_1.default.getPreciosPTxSemanaZonaAutor);
        this.router.get('/lista-precios-item/:itemcode', mrpController_1.default.getListaPreciosItemSap);
        this.router.get('/items-mp-by-item-pt/:itemcode', mrpController_1.default.getItemsMPbyItemPT);
        this.router.get('/precio-mp-item-ultimas-semanas', mrpController_1.default.getPreciosMPItemUltimasSemanas);
        this.router.get('/precio-mercado-item-semana', mrpController_1.default.getPrecioMercadoItemSemana);
        this.router.post('/actualizar-parametros-calculadora', mrpController_1.default.updateParametrosCalc);
        this.router.get('/parametros-mp-calculadora', mrpController_1.default.getParametrosMP);
        this.router.post('/nuevo-autor', mrpController_1.default.nuevoAutor);
        this.router.post('/cargar-lp-mercado', multer_1.default.single('myFileLP'), mrpController_1.default.cargarLPMercado);
        this.router.post('/cargar-lp-mp', multer_1.default.single('myFileMP'), mrpController_1.default.cargarLPMP);
        this.router.post('/cargar-lp-sugerido', multer_1.default.single('myFileLPSugerido'), mrpController_1.default.cargarLPSugerido);
        this.router.post('/grabar-calculo-precios-item', mrpController_1.default.grabarCalculoPreciosItem);
        this.router.get('/consulta-calculos-item', mrpController_1.default.getInfoCalculoItem);
        this.router.get('/precio-venta-item', mrpController_1.default.getPrecioVentaItemSAP);
    }
}
const mrpRoutes = new MrpRoutes();
exports.default = mrpRoutes.router;
