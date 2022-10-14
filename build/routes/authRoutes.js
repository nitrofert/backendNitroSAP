"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/login', authController_1.default.login);
        this.router.get('/infoUsuario', authController_1.default.infoUsuario);
        this.router.get('/menuUsuario', authController_1.default.menuUsuario);
        this.router.get('/perfilesUsuario', authController_1.default.perfilesUsuario);
        this.router.get('/permisosUsuario', authController_1.default.permisosUsuario);
        this.router.post('/recovery', authController_1.default.recovery);
        this.router.post('/restore', authController_1.default.restore);
        this.router.get('/dependenciesUser', authController_1.default.dependenciesUser);
        this.router.get('/dependenciesUserXE', authController_1.default.dependenciesUserXE);
        this.router.get('/storesUser', authController_1.default.almacenUser);
        this.router.get('/storesUser2', authController_1.default.almacenUserXE);
        this.router.get('/areasUser', authController_1.default.areasUserXE);
    }
}
const authRoutes = new AuthRoutes();
exports.default = authRoutes.router;
