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
class PerfilController {
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
                const perfil = yield database_1.db.query(`
        
            SELECT t0.* 
            FROM perfiles t0
            ORDER BY t0.perfil ASC`);
                res.json(perfil);
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
                const newPerfil = req.body;
                console.log(newPerfil);
                const result = yield database_1.db.query('INSERT INTO perfiles set ?', [newPerfil]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    getPerfilById(req, res) {
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
                const perfil = yield database_1.db.query(`
            
            SELECT t0.*
            FROM perfiles t0
            where t0.id = ?
            ORDER BY t0.perfil ASC`, [id]);
                res.json(perfil);
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
                const perfil = req.body;
                console.log(perfil);
                const idPerfil = perfil.id;
                const newPerfil = {
                    perfil: perfil.perfil,
                    description: perfil.description,
                    estado: perfil.estado
                };
                const result = yield database_1.db.query('update perfiles set ? where id = ?', [newPerfil, idPerfil]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
}
const perfilController = new PerfilController();
exports.default = perfilController;
