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
const node_fetch_1 = __importDefault(require("node-fetch"));
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log(req.body);
            //Recibe los campos del formulario Login y lo alamacenamos en una constante formLogin
            const formLogin = {
                username: req.body.username,
                password: yield helpers_1.default.encryptPassword(req.body.password),
                company: req.body.company
            };
            //console.log(formLogin);
            //Consultamos la tabla de usuarios con el nombre de usuario proporcionado en el formulario
            const user = yield database_1.db.query(`
        
            SELECT t0.id, t0.username,t0.password, t2.id as companyid 
                FROM users t0 
                INNER JOIN company_users t1 ON t1.id_user = t0.id
                INNER JOIN companies t2 ON t1.id_company = t2.id
                WHERE (username = ? or email = ?) and id_company = ?`, [formLogin.username, formLogin.username, formLogin.company]);
            // Validamos si el usuario buscado por el username existe, si no existe retornamos error
            if (user.length == 0)
                return res.status(401).json({ message: "Datos de inicio de sesión invalidos1", status: 401 });
            //console.log(user);
            //Comparamos el pasword registrado en el formulario con el password obtenido del query x username
            const validPassword = yield helpers_1.default.matchPassword(req.body.password, (user[0].password || ''));
            //console.log(validPassword);
            // Si el passwornno coincide, retornamos error 
            if (!validPassword)
                return res.status(401).json({ message: "Datos de inicio de sesión invalidos2", status: 401 });
            //Obtener datos de usuario para ecriptar en token jwt
            const infoUsuario = yield database_1.db.query(`
        SELECT t0.id, fullname, email, username, codusersap, t0.status, 
               id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap  
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`, [user[0].id, user[0].companyid]);
            const perfilesUsuario = yield database_1.db.query(`SELECT t0.id, t0.perfil 
                                                FROM perfiles t0 
                                                INNER JOIN perfil_users t1 ON t1.id_perfil = t0.id 
                                                WHERE t1.id_user = ?`, [user[0].id]);
            const opcionesMenu = yield database_1.db.query(`SELECT t0.* 
                                            FROM menu t0 
                                            INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
                                            WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                                                t0.hierarchy ='P' AND
                                                t1.read_accion = true
                                            ORDER BY t0.ordernum ASC;`, [user[0].id]);
            const opcionesSubMenu = yield database_1.db.query(`SELECT t0.* 
                                                FROM menu t0 
                                                INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
                                                WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                                                    t0.hierarchy ='H' AND
                                                    t1.read_accion = true AND
                                                    t0.visible =1
                                                ORDER BY t0.ordernum ASC;`, [user[0].id]);
            const permisosUsuario = yield database_1.db.query(`SELECT * 
                                                        FROM perfil_menu_accions t0 
                                                        INNER JOIN  perfiles t1 ON t1.id = t0.id_perfil
                                                        INNER JOIN menu t2 ON t2.id = t0.id_menu
                                                        WHERE t0.id_perfil IN (SELECT tt0.id_perfil FROM perfil_users tt0 WHERE tt0.id_user = ?)`, [user[0].id]);
            const almacenesUsuario = [];
            let userConfig = {
                infoUsuario: infoUsuario[0],
                perfilesUsuario,
                permisosUsuario,
                menuUsuario: {
                    opcionesMenu,
                    opcionesSubMenu
                }
            };
            //Retorno de respuesta exitosa y datos del usuario logueado o token
            //console.log(JSON.stringify(userConfig));
            const dataUser = JSON.stringify(userConfig);
            //const token:String = jwt.sign(dataUser,'secreetkey',signInOptions);
            const token = yield helpers_1.default.generateToken(userConfig);
            //console.log({message:`!Bienvenido ${userConfig.infoUsuario.fullname}¡`, status:200,infoUsuario,token});
            return res.json({ message: `!Bienvenido ${userConfig.infoUsuario.fullname}¡`, status: 200, infoUsuario, token });
        });
    }
    recovery(req, res) {
        const formRecovery = req.body;
        res.json({ message: "Response recovery", status: 202 });
    }
    restore(req, res) {
        const formRestore = req.body;
        res.json({ message: "Response recovery", status: 202 });
    }
    dependenciesUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            try {
                const dependenciasUsuario = yield database_1.db.query(`SELECT * FROM ${bdmysql}.dependencies_user WHERE codusersap = '${infoUsuario.codusersap}'`);
                res.json(dependenciasUsuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    areasSolpedUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            try {
                const dependenciasUsuario = yield database_1.db.query(`SELECT * FROM ${bdmysql}.areas_user WHERE codusersap = '${infoUsuario.codusersap}'`);
                res.json(dependenciasUsuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    almacenUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            try {
                const dependenciasUsuario = yield database_1.db.query(`SELECT * FROM ${bdmysql}.stores_users WHERE codusersap = '${infoUsuario.codusersap}'`);
                res.json(dependenciasUsuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    almacenUserXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bdmysql = infoUsuario.bdmysql;
            const compania = infoUsuario.dbcompanysap;
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAlmacenXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    dependenciesUserXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    areasUserXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAreasSolpedXUsuario.xsjs?usuario=${infoUsuario.codusersap}&compania=${compania}`;
            //console.log(url2);
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
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
const authController = new AuthController();
exports.default = authController;
