"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wssapController_1 = __importDefault(require("../controllers/wssapController"));
class WsSAPRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/BusinessPartners', wssapController_1.default.BusinessPartners);
        this.router.get('/BusinessPartnersXE/:id?', wssapController_1.default.BusinessPartnersXE);
        this.router.get('/Items', wssapController_1.default.Items);
        this.router.get('/Cuentas', wssapController_1.default.Cuentas);
        this.router.get('/Xengine/items', wssapController_1.default.itemsXengine);
        this.router.get('/Xengine/monedas/:fechaTrm', wssapController_1.default.monedasXengine);
        this.router.get('/Xengine/aprobaciones', wssapController_1.default.AprobacionesXE);
    }
}
const wssapRoutes = new WsSAPRoutes();
exports.default = wssapRoutes.router;
