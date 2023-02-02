"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = __importDefault(require("../controllers/reportesController"));
class ReportesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/evaluacionProveedores', reportesController_1.default.evaluacionProveedores);
        this.router.post('/detalleEntradasProveedor', reportesController_1.default.detalleEntradasProveedor);
        /*this.router.put('/', entradaController.update);
         
        this.router.post('/envio-aprobacion',entradaController.envioAprobacionSolped);
        this.router.get('/aprobar/:idcrypt',entradaController.aprovedMail);
        this.router.get('/rechazar/:idcrypt',entradaController.reject);
        this.router.put('/rechazar',entradaController.rejectSolped);
        this.router.post('/aprobacion',entradaController.aproved_portal);
        this.router.get('/aprobaciones/:id',entradaController.listAprobaciones);
        this.router.post('/cancelacion',entradaController.cancelacionSolped);*/
    }
}
const reportesRoutes = new ReportesRoutes();
exports.default = reportesRoutes.router;
