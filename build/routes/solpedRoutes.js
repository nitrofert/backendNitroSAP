"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const solpedController_1 = __importDefault(require("../controllers/solpedController"));
class SolpedRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', solpedController_1.default.list);
        this.router.post('/', solpedController_1.default.create);
        this.router.get('/:id', solpedController_1.default.getSolpedById);
        this.router.put('/', solpedController_1.default.update);
    }
}
const solpedRoutes = new SolpedRoutes();
exports.default = solpedRoutes.router;
