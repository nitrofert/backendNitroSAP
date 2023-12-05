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
const https_1 = __importDefault(require("https"));
const helpers_1 = __importDefault(require("../lib/helpers"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class SharedFunctionsController {
    taxes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                //console.log(bdmysql);
                let where = "";
                if (req.params.taxOption) {
                    where = ` where ${req.params.taxOption} = 'Y'`;
                }
                const solped = yield database_1.db.query(`Select * from ${bdmysql}.taxes ${where}`);
                res.json(solped);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    taxesXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsImpuestosCompras.xsjs?compania=${compania}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    cuentasDependenciaXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                //******************************************************* */
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                let dependencia = req.params.dependencia;
                //console.log(dependencia);
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsCuentasXDependencia.xsjs?compania=${compania}&dependencia=${dependencia}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const sharedFunctionsController = new SharedFunctionsController();
exports.default = sharedFunctionsController;
