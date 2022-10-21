"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
//import uuid from 'uuid/v4';
// Settings
const storage = multer_1.default.diskStorage({
    destination: 'uploads/solped',
    filename: (req, file, cb) => {
        let fileName = Date.now();
        cb(null, fileName + path_1.default.extname(file.originalname));
    }
});
exports.default = (0, multer_1.default)({ storage });
