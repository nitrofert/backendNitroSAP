"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perfilController_1 = __importDefault(require("../controllers/perfilController"));
class PerfilRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', perfilController_1.default.list);
        this.router.post('/', perfilController_1.default.create);
        this.router.get('/:id', perfilController_1.default.getPerfilById);
        this.router.put('/', perfilController_1.default.update);
    }
}
const perfilRoutes = new PerfilRoutes();
exports.default = perfilRoutes.router;
