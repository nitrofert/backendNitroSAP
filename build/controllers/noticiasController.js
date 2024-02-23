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
class NoticiasController {
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
                //console.log(new Date().toISOString());
                const noticias = yield database_1.db.query("SELECT * from noticias");
                // console.log(companies);
                res.json(noticias);
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
                let hoy = new Date();
                //******************************************************* */
                //const companies: CompanyInterface[] = await db.query("SELECT * from companies where status ='A'");
                const noticias = yield database_1.db.query(`SELECT * from noticias t0 where '${hoy.toISOString().split('T')[0]}' BETWEEN t0.fechapub AND t0.fechafinpub`);
                // console.log(companies);
                res.json(noticias);
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
                const noticia = req.body;
                //console.log(company);
                const nuevaNoticia = {
                    titulo: noticia.titulo,
                    fechapub: noticia.fechapub.split('T')[0],
                    fechafinpub: noticia.fechafinpub.split('T')[0],
                    descripcion: noticia.descripcion,
                    recurso: noticia.recurso,
                    autor: noticia.autor
                };
                //console.log(newCompany);
                const result = yield database_1.db.query('INSERT INTO noticias set ?', [nuevaNoticia]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    getNoticiaById(req, res) {
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
                const noticia = yield database_1.db.query(`SELECT * FROM noticias t0 where t0.id = ?`, [id]);
                res.json(noticia);
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
                const noticia = req.body;
                //console.log(company);
                const idNoticia = noticia.id;
                const updateNoticia = {
                    titulo: noticia.titulo,
                    estado: noticia.estado,
                    fechapub: noticia.fechapub.split('T')[0],
                    fechafinpub: noticia.fechafinpub.split('T')[0],
                    descripcion: noticia.descripcion,
                    recurso: noticia.recurso,
                };
                const result = yield database_1.db.query('update noticias set ? where id = ?', [updateNoticia, idNoticia]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const noticiasController = new NoticiasController();
exports.default = noticiasController;
