"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresaController_1 = __importDefault(require("../controllers/empresaController"));
class EmpresaRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', empresaController_1.default.list);
        this.router.post('/', empresaController_1.default.create);
        this.router.get('/:id', empresaController_1.default.getEmpresaById);
        this.router.put('/', empresaController_1.default.update);
    }
}
const empresaRoutes = new EmpresaRoutes();
exports.default = empresaRoutes.router;
