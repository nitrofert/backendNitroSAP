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
class PermisoController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* /
            try {
                const permisos = yield database_1.db.query(`
        
            SELECT t0.id AS idPerfil,
                t0.perfil,
                    t1.id AS idMenu, 
                    t1.title,
                    IFNULL(t2.read_accion,0) AS read_accion,
                    IFNULL(t2.create_accion,0) AS create_accion,
                    IFNULL(t2.update_accion,0) AS update_accion,
                    IFNULL(t2.delete_accion,0) AS delete_accion,
                    IFNULL(t2.aproved_accion,0) AS aproved_accion  
            FROM perfiles t0 
            JOIN menu t1
            LEFT JOIN perfil_menu_accions t2 ON t0.id = t2.id_perfil AND t1.id = t2.id_menu 
            ORDER BY t0.id, t1.ordernum ASC`);
                res.json(permisos);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
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
            const permiso = req.body;
            console.log(permiso);
            try {
                //Validar si el permiso esta registrado
                const existePermiso = yield database_1.db.query(`
            SELECT COUNT(*) as cntPermisos
            FROM perfil_menu_accions 
            WHERE id_perfil = ? AND id_menu = ?
            `, [permiso.idPerfil, permiso.idMenu]);
                console.log(existePermiso);
                let SQLpermiso = "";
                if (existePermiso[0].cntPermisos > 0) {
                    //Actualiza la accion del permiso
                    SQLpermiso = `Update perfil_menu_accions 
                                set ${permiso.accion}=${permiso.valor}
                            where id_perfil = ? AND id_menu = ?`;
                    const result = yield database_1.db.query(SQLpermiso, [permiso.idPerfil, permiso.idMenu]);
                    res.json(result);
                }
                else {
                    //Inserta el permiso con los datos enviados
                    let newPermiso = {
                        id_menu: permiso.idMenu,
                        id_perfil: permiso.idPerfil
                    };
                    if (permiso.accion === 'read_accion')
                        newPermiso.read_accion = permiso.valor;
                    if (permiso.accion === 'create_accion')
                        newPermiso.create_accion = permiso.valor;
                    if (permiso.accion === 'update_accion')
                        newPermiso.update_accion = permiso.valor;
                    if (permiso.accion === 'delete_accion')
                        newPermiso.delete_accion = permiso.valor;
                    if (permiso.accion === 'aproved_accion')
                        newPermiso.aproved_accion = permiso.valor;
                    console.log(newPermiso);
                    SQLpermiso = `Insert into perfil_menu_accions set ? `;
                    const result = yield database_1.db.query(SQLpermiso, [newPermiso]);
                    res.json(result);
                }
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            try {
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
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            try {
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
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            try {
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
const permisoController = new PermisoController();
exports.default = permisoController;
