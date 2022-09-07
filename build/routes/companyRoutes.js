"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyController_1 = __importDefault(require("../controllers/companyController"));
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/list', companyController_1.default.list);
        this.router.get('/listActive', companyController_1.default.listActive);
        this.router.post('/', companyController_1.default.create);
        this.router.get('/:id', companyController_1.default.getCompanyById);
        this.router.put('/', companyController_1.default.update);
    }
}
const authRoutes = new AuthRoutes();
exports.default = authRoutes.router;
