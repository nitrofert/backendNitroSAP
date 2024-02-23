"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noticiasController_1 = __importDefault(require("../controllers/noticiasController"));
class NoticiasRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/', noticiasController_1.default.list);
        this.router.get('/activas', noticiasController_1.default.listActive);
        this.router.post('/', noticiasController_1.default.create);
        this.router.get('/:id', noticiasController_1.default.getNoticiaById);
        this.router.put('/', noticiasController_1.default.update);
    }
}
const noticiasRoutes = new NoticiasRoutes();
exports.default = noticiasRoutes.router;
