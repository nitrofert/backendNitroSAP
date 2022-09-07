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
class SharedFunctionsController {
    taxes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            console.log(bdmysql);
            let where = "";
            if (req.params.taxOption) {
                where = ` where ${req.params.taxOption} = 'Y'`;
            }
            const solped = yield database_1.default.query(`Select * from ${bdmysql}.taxes ${where}`);
            console.log(JSON.stringify(solped));
            res.json(solped);
        });
    }
}
const sharedFunctionsController = new SharedFunctionsController();
exports.default = sharedFunctionsController;
