"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = __importDefault(require("../controllers/configController"));
class ConfigRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/menu/:id', configController_1.default.list);
        this.router.get('/series', configController_1.default.loadSeriesSapToMysql);
        this.router.get('/impuestos', configController_1.default.loadTaxesSapToMysql);
        this.router.get('/items', configController_1.default.loadItemsSapToMysql);
        this.router.get('/almacenes', configController_1.default.loadAlmacenesSapToMysql);
        this.router.get('/cuentas-contable', configController_1.default.loadCuentasContablesSapToMysql);
        this.router.get('/modelos-aprobacion', configController_1.default.loadModelosAprobacionSapToMysql);
        this.router.get('/proveedores', configController_1.default.loadProveedoresSapToMysql);
        this.router.get('/udo-usuarios', configController_1.default.loadUdoUsuariosSapToMysql);
        this.router.get('/udo-dependencias', configController_1.default.loadDependenciasSapToMysql);
        this.router.get('/udo-cuentas-dependencias', configController_1.default.loadCuentasDependenciasSapToMysql);
        this.router.get('/tasa-cambio/:fechaTrm', configController_1.default.loadTasasDeCambio);
        this.router.get('/recetas_item_pt', configController_1.default.loadRecetasItemPT);
        this.router.get('/lista_precios_sap_pt', configController_1.default.loadListaPreciosSAPPT);
        this.router.get('/lista_precio_ventas_l2w', configController_1.default.loadListaPrecioVentasSAP);
    }
}
const configRoutes = new ConfigRoutes();
exports.default = configRoutes.router;
