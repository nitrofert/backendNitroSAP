"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', userController_1.default.list);
        this.router.get('/areas-usuario', userController_1.default.getAreasByUserSAP);
        this.router.get('/:id', userController_1.default.getUserById);
        this.router.get('/companies/:id', userController_1.default.getCompaniesUserById);
        this.router.get('/perfiles/:id', userController_1.default.getPerfilesUserById);
        this.router.post('/companies', userController_1.default.setCompaniesUser);
        this.router.post('/perfiles', userController_1.default.setPerfilUser);
        this.router.post('/', userController_1.default.create);
        this.router.put('/', userController_1.default.update);
        this.router.post('/adicionar-areas', userController_1.default.adicionarAreasUser);
        this.router.post('/eliminar-areas', userController_1.default.elimnarAreasUsuario);
        this.router.post('/adicionar-dependencias', userController_1.default.adicionarDependenciasUser);
        this.router.post('/eliminar-dependencias', userController_1.default.eliminarDependenciasUser);
        this.router.post('/adicionar-almacen', userController_1.default.adicionarAlmacenUser);
        this.router.post('/eliminar-almacen', userController_1.default.elimnarAlmacenUsuario);
    }
}
const userRoutes = new UserRoutes();
exports.default = userRoutes.router;
