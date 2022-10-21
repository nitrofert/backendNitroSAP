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
        this.router.get('/list', solpedController_1.default.list);
        this.router.post('/', solpedController_1.default.create);
        this.router.put('/', solpedController_1.default.update);
        this.router.get('/:id', solpedController_1.default.getSolpedById);
        this.router.post('/envio-aprobacion', solpedController_1.default.envioAprobacionSolped);
        this.router.get('/aprobar/:idcrypt', solpedController_1.default.aprovedMail);
        this.router.get('/rechazar/:idcrypt', solpedController_1.default.reject);
        this.router.put('/rechazar', solpedController_1.default.rejectSolped);
        this.router.post('/aprobacion', solpedController_1.default.aproved_portal);
        this.router.get('/aprobaciones/:id', solpedController_1.default.listAprobaciones);
        this.router.post('/cancelacion', solpedController_1.default.cancelacionSolped);
        this.router.post('/upload', multer_1.default.single('myFile'), solpedController_1.default.uploadAnexoSolped);
        this.router.post('/borraranexo', solpedController_1.default.borrarAnexoSolped);
    }
}
const solpedRoutes = new SolpedRoutes();
exports.default = solpedRoutes.router;
