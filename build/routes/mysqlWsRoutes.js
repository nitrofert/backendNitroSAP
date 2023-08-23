"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mysqlWsController_1 = __importDefault(require("../controllers/mysqlWsController"));
class MySQLWsRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/clientes', mysqlWsController_1.default.clientes);
    }
}
const mysqlWsRoutes = new MySQLWsRoutes();
exports.default = mysqlWsRoutes.router;
