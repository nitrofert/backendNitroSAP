"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permisoController_1 = __importDefault(require("../controllers/permisoController"));
class PermisoRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', permisoController_1.default.list);
        this.router.get('/:id', permisoController_1.default.getById);
        this.router.post('/', permisoController_1.default.create);
        this.router.put('/', permisoController_1.default.update);
        this.router.delete('/:id', permisoController_1.default.delete);
    }
}
const permisoRoutes = new PermisoRoutes();
exports.default = permisoRoutes.router;
