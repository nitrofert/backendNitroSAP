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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
class MySQLWsController {
    clientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = req.query;
            console.log(params);
            try {
                let where = "";
                if (params.cardcode) {
                    if (where == "") {
                        where = ` WHERE t0.CardCode = '${params.cardcode}' `;
                    }
                    else {
                        where = ` AND t0.CardCode = '${params.cardcode}' `;
                    }
                }
                let query = `SELECT * FROM ${params.compania}.socios_negocio t0 ${where}`;
                let cleintes = yield yield database_1.db.query(query);
                console.log(cleintes);
                res.json(cleintes);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const mysqlWsQueriesController = new MySQLWsController();
exports.default = mysqlWsQueriesController;
