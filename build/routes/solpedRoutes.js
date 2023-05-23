"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const solpedController_1 = __importDefault(require("../controllers/solpedController"));
const multer_1 = __importDefault(require("../lib/multer"));
class SolpedRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', solpedController_1.default.listadoSolpeds);
        this.router.get('/list/aprobadas', solpedController_1.default.listAprobadores);
        this.router.post('/', solpedController_1.default.create);
        this.router.post('/detail', solpedController_1.default.createDetail);
        this.router.put('/', solpedController_1.default.update);
        this.router.get('/proyectos', solpedController_1.default.getProyectos);
        this.router.get('/:id', solpedController_1.default.getSolpedById);
        this.router.post('/envio-aprobacion', solpedController_1.default.envioAprobacionSolped2);
        this.router.get('/aprobar/:idcrypt', solpedController_1.default.aprovedMail);
        this.router.get('/rechazar/:idcrypt', solpedController_1.default.reject);
        this.router.put('/rechazar', solpedController_1.default.rejectSolped);
        this.router.post('/aprobacion', solpedController_1.default.aproved_portal3);
        this.router.get('/aprobaciones/:id', solpedController_1.default.listAprobaciones);
        this.router.post('/cancelacion', solpedController_1.default.cancelacionSolped);
        this.router.post('/upload', multer_1.default.single('myFile'), solpedController_1.default.uploadAnexoSolped);
        this.router.post('/borraranexo', solpedController_1.default.borrarAnexoSolped);
        this.router.post('/download', solpedController_1.default.downloadAnexoSolped);
        this.router.get('/list/mp', solpedController_1.default.listMP);
        this.router.get('/list/mps/:status', solpedController_1.default.listMPS4);
        this.router.get('/list/documentsTracking', solpedController_1.default.documentsTracking);
        this.router.get('/list/ocmp/:status', solpedController_1.default.listOCMP);
        this.router.get('/list/inmp', solpedController_1.default.listInMP);
        this.router.post('/mp', solpedController_1.default.createMP);
        this.router.put('/mp', solpedController_1.default.updateMP);
        this.router.put('/cantidadmp', solpedController_1.default.updateCantidadMP);
        this.router.post('/enviar-sap', solpedController_1.default.enviarSolpedSAP2);
        this.router.put('/enviar-sap', solpedController_1.default.actualizarSolpedSAP);
        this.router.put('/enviar-sap-pedido', solpedController_1.default.actualizarPedidoSAP);
        this.router.post('/aprobar', solpedController_1.default.aprovedMail2);
        this.router.post('/rechazar', solpedController_1.default.rejectMail);
        this.router.get('/anexo/:id/:id2', solpedController_1.default.getAnexoSolpedById);
    }
}
const solpedRoutes = new SolpedRoutes();
exports.default = solpedRoutes.router;
