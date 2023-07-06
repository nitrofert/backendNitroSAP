"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const entradaController_1 = __importDefault(require("../controllers/entradaController"));
class EntradaRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', entradaController_1.default.list);
        this.router.post('/', entradaController_1.default.create);
        this.router.get('/:id', entradaController_1.default.getEntradaById);
        this.router.get('/impresion/:id', entradaController_1.default.getEntradaByIdSL);
        this.router.patch('/cancel/:id', entradaController_1.default.cancel);
        this.router.get('/pedido/:id', entradaController_1.default.entradasByPedido);
        this.router.post('/aprobar-entradas', entradaController_1.default.aprobarEntradas);
        /*this.router.put('/', entradaController.update);
         
        
        this.router.get('/aprobar/:idcrypt',entradaController.aprovedMail);
        this.router.get('/rechazar/:idcrypt',entradaController.reject);
        this.router.put('/rechazar',entradaController.rejectSolped);
        this.router.post('/aprobacion',entradaController.aproved_portal);
        this.router.get('/aprobaciones/:id',entradaController.listAprobaciones);
        this.router.post('/cancelacion',entradaController.cancelacionSolped);*/
    }
}
const entradaRoutes = new EntradaRoutes();
exports.default = entradaRoutes.router;
