"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
class ComapnyController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const companies = yield database_1.default.query("SELECT * from companies");
            res.json({ 'companies': companies });
        });
    }
    getUserById(req, res) {
        res.json({ 'text': 'Game selected ' + req.params.id });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = req.body;
            console.log(company);
            yield database_1.default.query('INSERT INTO companies set ?', [company]);
            res.json({ 'message': 'Game saved' });
        });
    }
    update(req, res) {
        res.json({ 'text': 'Update Games controller ' + req.params.id });
    }
    delete(req, res) {
        res.json({ 'text': 'Delete Games controller ' + req.params.id });
    }
}
const companyController = new ComapnyController();
exports.default = companyController;
