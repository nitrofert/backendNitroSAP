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
        this.router.post('/recovery', authController_1.default.recovery);
        this.router.post('/restore', authController_1.default.restore);
        this.router.get('/dependenciesUser', authController_1.default.dependenciesUser);
        this.router.get('/storesUser', authController_1.default.almacenUser);
    }
}
const authRoutes = new AuthRoutes();
exports.default = authRoutes.router;
