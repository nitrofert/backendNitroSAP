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
const helpers_1 = __importDefault(require("../lib/helpers"));
class SolpedController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            console.log(bdmysql);
            const solped = yield database_1.default.query(`Select * from ${bdmysql}.solped`);
            console.log(solped);
            res.json(solped);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const newSolped = req.body;
            console.log(newSolped);
            const result = yield database_1.default.query('START TRANSACTION');
            console.log(result);
            //const result = await db.query('INSERT INTO solped set ?', [newSolped]);
            res.json(result);
        });
    }
    getSolpedById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            const comapny = yield database_1.default.query(`
      
      SELECT t0.*
      FROM companies t0
      where t0.id = ?
      ORDER BY t0.companyname ASC`, [id]);
            res.json(comapny);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const company = req.body;
            console.log(company);
            const idCompany = company.id;
            const newCompany = {
                companyname: company.companyname,
                status: company.status,
                urlwsmysql: company.urlwsmysql,
                logoempresa: company.logoempresa,
                urlwssap: company.urlwssap,
                dbcompanysap: company.dbcompanysap
            };
            const result = yield database_1.default.query('update companies set ? where id = ?', [newCompany, idCompany]);
            res.json(result);
        });
    }
}
const solpedController = new SolpedController();
exports.default = solpedController;
