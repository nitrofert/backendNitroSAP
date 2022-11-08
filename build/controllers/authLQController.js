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
const helpers_1 = __importDefault(require("../lib/helpers"));
class AuthLQController {
    titulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const infoLog = yield helpers_1.default.loginWsLQ();
            console.log(infoLog.data.access_token);
            const titulos = yield helpers_1.default.getTitulosLQ(infoLog.data.access_token);
            let dataTitulo;
            for (let titulo of titulos.results) {
                //console.log(titulo);
                let no_titulo = titulo.no_titulo;
                let tituloSap = yield helpers_1.default.getTituloById(no_titulo);
                console.log(tituloSap.value);
                if (tituloSap.value.length == 0) {
                    //Insertar factura en udo
                    let nit_pagador_sap = yield helpers_1.default.getNitProveedorByTitulo(no_titulo);
                    console.log(nit_pagador_sap);
                    //dataTitulo = {}
                }
            }
            res.json(titulos);
        });
    }
    pagos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const infoLog = yield helpers_1.default.loginWsLQ();
            console.log(infoLog.data.access_token);
            const pagos = yield helpers_1.default.getPagosLQ(infoLog.data.access_token);
            res.json(pagos);
        });
    }
}
const authLQController = new AuthLQController();
exports.default = authLQController;
