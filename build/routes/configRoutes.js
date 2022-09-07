"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = __importDefault(require("../controllers/configController"));
class ConfigRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/menu/:id', configController_1.default.list);
    }
}
const configRoutes = new ConfigRoutes();
exports.default = configRoutes.router;
