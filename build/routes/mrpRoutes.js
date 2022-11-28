"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mrpController_1 = __importDefault(require("../controllers/mrpController"));
class MrpRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/zonas', mrpController_1.default.zonas);
        this.router.post('/inventarios', mrpController_1.default.inventarios);
        this.router.post('/inventariosTracking', mrpController_1.default.inventariosTracking);
        this.router.post('/presupuestosVenta', mrpController_1.default.presupuestosVenta);
        this.router.post('/maxminitemzona', mrpController_1.default.maxminItemZona);
    }
}
const mrpRoutes = new MrpRoutes();
exports.default = mrpRoutes.router;
