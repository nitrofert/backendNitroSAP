"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mysqlController_1 = __importDefault(require("../controllers/mysqlController"));
class MySQLRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/load-config-solped', mysqlController_1.default.configSolped);
        this.router.get('/load-config-solped-mp', mysqlController_1.default.configSolpedMP);
        this.router.get('/load-config-calculadora-precios', mysqlController_1.default.configCalculadoraPrecios);
        this.router.get('/series/:objtype?', mysqlController_1.default.series);
        this.router.get('/cuentas', mysqlController_1.default.cuentas);
        this.router.get('/impuestos-compra', mysqlController_1.default.impuestosCompra);
        this.router.get('/items', mysqlController_1.default.items);
        this.router.get('/items-calculadora', mysqlController_1.default.itemsCalculadora);
        this.router.get('/items-mp', mysqlController_1.default.itemsMP);
        this.router.get('/items-pt', mysqlController_1.default.itemsPT);
        this.router.get('/almacenes', mysqlController_1.default.almacenes);
        this.router.get('/zonas', mysqlController_1.default.zonas);
        this.router.get('/monedas', mysqlController_1.default.monedas);
        this.router.get('/socios-negocio', mysqlController_1.default.sociosNegocio);
        this.router.get('/areas-usuario', mysqlController_1.default.areasUsuario);
        this.router.get('/dependencias-usuario', mysqlController_1.default.dependeciasUsuario);
        this.router.get('/almacenes-usuario', mysqlController_1.default.almacenesUsuario);
        this.router.get('/cuentas-dependencia/:dependencia?', mysqlController_1.default.cuentasDependencia);
        this.router.get('/dependencias', mysqlController_1.default.dependecias);
        this.router.get('/areas', mysqlController_1.default.areas);
        this.router.get('/autores', mysqlController_1.default.autores);
        this.router.get('/lista-calculos-precios-item', mysqlController_1.default.listaPreciosCalculados);
        this.router.get('/receta-item/:item', mysqlController_1.default.recetaItem);
        this.router.get('/lista-precios-sap-item/:item', mysqlController_1.default.listaPreciosSAPItem);
        this.router.get('/lista-precios-venta-item/:item', mysqlController_1.default.listaPreciosVentaSAPItem);
    }
}
const mysqlRoutes = new MySQLRoutes();
exports.default = mysqlRoutes.router;
