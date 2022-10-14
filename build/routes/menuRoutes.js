"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuController_1 = __importDefault(require("../controllers/menuController"));
class MenuRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        console.log('menu routes');
        this.config();
    }
    config() {
        this.router.get('/list', menuController_1.default.list);
        this.router.get('/listFather', menuController_1.default.listFather);
        this.router.get('/orderNum/:hierarchy/:iddad?', menuController_1.default.orderNum);
        this.router.post('/', menuController_1.default.create);
        this.router.get('/:id', menuController_1.default.getMenuById);
        this.router.put('/', menuController_1.default.update);
        this.router.delete('/:id', menuController_1.default.delete);
    }
}
const menuRoutes = new MenuRoutes();
exports.default = menuRoutes.router;
