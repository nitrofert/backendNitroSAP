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
const database_1 = require("../database");
const helpers_1 = __importDefault(require("../lib/helpers"));
class ComapnyController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const companies = yield database_1.db.query("SELECT * from companies");
                // console.log(companies);
                res.json(companies);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    listActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const companies = yield database_1.db.query("SELECT * from companies where status ='A'");
                // console.log(companies);
                res.json(companies);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const newCompany = req.body;
                //console.log(newCompany);
                const result = yield database_1.db.query('INSERT INTO companies set ?', [newCompany]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    getCompanyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const { id } = req.params;
                const comapny = yield database_1.db.query(`
      
            SELECT t0.*
            FROM companies t0
            where t0.id = ?
            ORDER BY t0.companyname ASC`, [id]);
                res.json(comapny);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const company = req.body;
                //console.log(company);
                const idCompany = company.id;
                const newCompany = {
                    companyname: company.companyname,
                    status: company.status,
                    urlwsmysql: company.urlwsmysql,
                    logoempresa: company.logoempresa,
                    urlwssap: company.urlwssap,
                    dbcompanysap: company.dbcompanysap
                };
                const result = yield database_1.db.query('update companies set ? where id = ?', [newCompany, idCompany]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const companyController = new ComapnyController();
exports.default = companyController;
