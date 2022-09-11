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
class UserController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const users = yield database_1.db.query("SELECT * FROM users");
            res.json(users);
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            const user = yield database_1.db.query("SELECT * FROM usuariosportal.users where id= ?", [id]);
            res.json(user);
        });
    }
    getCompaniesUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            const userCompanies = yield database_1.db.query(`
       SELECT t0.id,t0.companyname, 
              (SELECT COUNT(*) 
              FROM company_users t1 
              WHERE t1.id_company = t0.id AND 
                    id_user = ?)AS company_access 
        FROM companies t0 
        WHERE t0.status = 'A'
       `, [id]);
            res.json(userCompanies);
        });
    }
    getPerfilesUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            const userPerfiles = yield database_1.db.query(`
       SELECT *, 
              (SELECT COUNT(*) 
               FROM perfil_users t1 
               WHERE t1.id_perfil = t0.id AND 
                     t1.id_user = ?) AS perfil_user
        FROM perfiles t0  
        WHERE estado = 'A'
       `, [id]);
            res.json(userPerfiles);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.body;
            console.log(user);
            user.password = yield helpers_1.default.encryptPassword(user.password || '');
            const result = yield database_1.db.query('INSERT INTO users set ?', [user]);
            res.json(result);
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
            const user = req.body;
            console.log(user);
            const idUser = user.id;
            const newUser = {
                fullname: user.fullname,
                email: user.email,
                username: user.username,
                status: user.status,
                codusersap: user.codusersap
            };
            if (user.password != "") {
                user.password = yield helpers_1.default.encryptPassword(user.password || '');
                newUser.password = user.password;
            }
            console.log(user);
            const result = yield database_1.db.query('update users set ? where id = ?', [newUser, idUser]);
            res.json(result);
        });
    }
    setCompaniesUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const accessRequest = req.body;
            let sqlAccess = "";
            if (accessRequest.valor == 0) {
                //Eliminar acceso de la empresa seleccionada
                sqlAccess = `Delete from company_users where id_company = ? and id_user = ?`;
            }
            else {
                //Otorgar acceso a la empresa seleccionada
                sqlAccess = `Insert into company_users (id_company,id_user) values(?,?)`;
            }
            const result = yield database_1.db.query(sqlAccess, [accessRequest.id_company, accessRequest.id_user]);
            res.json(result);
        });
    }
    setPerfilUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const perfilRequest = req.body;
            let sqlAccess = "";
            if (perfilRequest.valor == 0) {
                //Eliminar acceso de la empresa seleccionada
                sqlAccess = `Delete from perfil_users where id_perfil = ? and id_user = ?`;
            }
            else {
                //Otorgar acceso a la empresa seleccionada
                sqlAccess = `Insert into perfil_users (id_perfil,id_user) values(?,?)`;
            }
            const result = yield database_1.db.query(sqlAccess, [perfilRequest.id_perfil, perfilRequest.id_user]);
            res.json(result);
        });
    }
}
const userController = new UserController();
exports.default = userController;
