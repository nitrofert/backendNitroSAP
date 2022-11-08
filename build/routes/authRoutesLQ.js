"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authLQController_1 = __importDefault(require("../controllers/authLQController"));
class AuthLQRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/titulos', authLQController_1.default.titulos);
        this.router.get('/titulos/pagos', authLQController_1.default.pagos);
    }
}
const authLQRoutes = new AuthLQRoutes();
exports.default = authLQRoutes.router;
