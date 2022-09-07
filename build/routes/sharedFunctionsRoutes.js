"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sharedFunctionsController_1 = __importDefault(require("../controllers/sharedFunctionsController"));
class SharedFunctionsRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/taxes/:taxOption?', sharedFunctionsController_1.default.taxes);
    }
}
const sharedFunctionsRoutes = new SharedFunctionsRoutes();
exports.default = sharedFunctionsRoutes.router;
