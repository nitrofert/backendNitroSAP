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
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                }
                //******************************************************* */
                const users = yield database_1.db.query("SELECT * FROM users");
                res.json(users);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const { id } = req.params;
                const user = yield database_1.db.query("SELECT * FROM users where id= ?", [id]);
                /*const areas_usuario = await db.query(`SELECT t0.id, t0.codusersap, t0.area
                FROM areas_user t0
                INNER JOIN companies t1 ON t1.id = t0.companyid
                WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);*/
                const areas_usuario = yield helpers_1.default.getAreasUserSAP(user[0].codusersap, bdmysql);
                const dependencias_usuario = yield database_1.db.query(`SELECT t0.id, t0.codusersap, t0.vicepresidency, t0.dependence, t0.location 
            FROM dependencies_user t0 
            INNER JOIN companies t1 ON t1.id = t0.companyid
            WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);
                const almacenes_usuario = yield database_1.db.query(`SELECT t0.id, t0.codusersap, t0.store
            FROM stores_users t0 
            INNER JOIN companies t1 ON t1.id = t0.companyid
            WHERE t0.codusersap = '${user[0].codusersap}' AND t1.urlwsmysql = '${bdmysql}'`);
                user[0].areas = areas_usuario;
                user[0].dependencias = dependencias_usuario;
                user[0].almacenes = almacenes_usuario;
                console.log(user);
                res.json(user);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getAreasByUserSAP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                const codusersap = infoUsuario[0].codusersap;
                //******************************************************* */
                let error = false;
                let message = "";
                const areas_usuario = yield helpers_1.default.getAreasUserSAP(codusersap, bdmysql);
                //console.log(areas_usuario);
                res.json(areas_usuario);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getCompaniesUserById(req, res) {
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
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    getPerfilesUserById(req, res) {
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
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
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
            try {
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
                if (user.password) {
                    user.password = yield helpers_1.default.encryptPassword(user.password || '');
                    newUser.password = user.password;
                }
                console.log(user);
                const result = yield database_1.db.query('update users set ? where id = ?', [newUser, idUser]);
                res.json(result);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    setCompaniesUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    setPerfilUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    adicionarAreasUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let areas = data.areas;
                let error = false;
                let message = "";
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioSL(infoUsuario[0], codusersap);
                console.log(udoUsuario);
                let NF_ALM_USUARIOS_SOLCollection = [];
                let areasUser = [];
                let lineAreaUser = [];
                for (let area of areas) {
                    NF_ALM_USUARIOS_SOLCollection.push({
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Object": "USU",
                        "U_NF_DIM2_DEP": area.U_NF_DIM2_DEP
                    });
                    lineAreaUser.push(codusersap);
                    lineAreaUser.push(area.U_NF_DIM2_DEP);
                    lineAreaUser.push(infoUsuario[0].id_company);
                    lineAreaUser.push(userid);
                    areasUser.push(lineAreaUser);
                    lineAreaUser = [];
                    console.log(areasUser);
                }
                if (udoUsuario.value.length > 0) {
                    //Registrar areas en udo de areas
                    let dataUdoAreas = {
                        NF_ALM_USUARIOS_SOLCollection
                    };
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], dataUdoAreas, udoUsuario.value[0].USU.Code, 'PATCH');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar las areas del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                    }
                }
                else {
                    //Crear udo para usuario en SAP
                    let dataUdo = {
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Name": null,
                        "Canceled": "N",
                        "Object": "USU",
                        "UserSign": infoUsuarioSAP.value[0].InternalKey,
                        "DataSource": "I",
                        "U_NF_COD_USUARIO": infoUsuarioSAP.value[0].InternalKey,
                        "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                        NF_ALM_USUARIOS_SOLCollection
                    };
                    let resultNewUdo = yield helpers_1.default.registerUdoSAPSL(infoUsuario[0], dataUdo);
                    console.log('resultNewUdo', resultNewUdo);
                    if (resultNewUdo != 201) {
                        //Error al crear UDO
                        error = true;
                        message = "Ocurio un error al crear el UDO del usuario en SAP";
                    }
                    else {
                        //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    }
                }
                if (!error) {
                    let resultRegisterAreasUserMSQL = yield helpers_1.default.RegisterAreasUserMSQL(areasUser);
                    if (resultRegisterAreasUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al registrar las areas del usuario en mysql";
                    }
                    else {
                        message = "Se ha registrado correctamente las areas seleccionadas";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    adicionarDependenciasUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let dependencias = data.dependencias;
                let error = false;
                let message = "";
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioSL(infoUsuario[0], codusersap);
                console.log(udoUsuario);
                let NF_ALM_USUARIOS_VICCollection = [];
                let dependenciasUser = [];
                let linedependenciaUser = [];
                for (let dependencia of dependencias) {
                    NF_ALM_USUARIOS_VICCollection.push({
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Object": "USU",
                        "U_NF_DIM3_VICE": dependencia.U_NF_DIM3_VICE,
                        "U_NF_DIM2_DEP": dependencia.U_NF_DIM2_DEP,
                        "U_NF_DIM1_LOC": dependencia.U_NF_DIM1_LOC
                    });
                    linedependenciaUser.push(codusersap);
                    linedependenciaUser.push(dependencia.U_NF_DIM2_DEP);
                    linedependenciaUser.push(dependencia.U_NF_DIM1_LOC);
                    linedependenciaUser.push(dependencia.U_NF_DIM3_VICE);
                    linedependenciaUser.push(infoUsuario[0].id_company);
                    linedependenciaUser.push(userid);
                    dependenciasUser.push(linedependenciaUser);
                    linedependenciaUser = [];
                    console.log(dependenciasUser);
                }
                if (udoUsuario.value.length > 0) {
                    //Registrar areas en udo de areas
                    let dataUdoDependencias = {
                        NF_ALM_USUARIOS_VICCollection
                    };
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], dataUdoDependencias, udoUsuario.value[0].USU.Code, 'PATCH');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar las areas del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                    }
                }
                else {
                    //Crear udo para usuario en SAP
                    let dataUdo = {
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Name": null,
                        "Canceled": "N",
                        "Object": "USU",
                        "UserSign": infoUsuarioSAP.value[0].InternalKey,
                        "DataSource": "I",
                        "U_NF_COD_USUARIO": infoUsuarioSAP.value[0].InternalKey,
                        "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                        NF_ALM_USUARIOS_VICCollection
                    };
                    let resultNewUdo = yield helpers_1.default.registerUdoSAPSL(infoUsuario[0], dataUdo);
                    console.log('resultNewUdo', resultNewUdo);
                    if (resultNewUdo != 201) {
                        //Error al crear UDO
                        error = true;
                        message = "Ocurio un error al crear el UDO del usuario en SAP";
                    }
                    else {
                        //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    }
                }
                if (!error) {
                    let resultRegisterDependenciasUserMSQL = yield helpers_1.default.RegisterDependenciasUserMSQL(dependenciasUser);
                    if (resultRegisterDependenciasUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al registrar las dependencias del usuario en mysql";
                    }
                    else {
                        message = "Se ha registrado correctamente las dependencias seleccionadas";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    elimnarAreasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                //console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let areas = data.areas;
                let error = false;
                let message = "";
                let idareas = areas.map((area) => {
                    return area.id;
                });
                console.log(areas, idareas);
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);
                console.log(udoUsuario);
                if (udoUsuario.error) {
                }
                else {
                    let NF_ALM_USUARIOS_SOLCollection = [];
                    for (let areasUDO of udoUsuario.NF_ALM_USUARIOS_SOLCollection) {
                        console.log(areasUDO.U_NF_DIM2_DEP);
                        if (areas.filter((area) => area.area == areasUDO.U_NF_DIM2_DEP).length == 0) {
                            NF_ALM_USUARIOS_SOLCollection.push(areasUDO);
                        }
                    }
                    console.log(NF_ALM_USUARIOS_SOLCollection);
                    udoUsuario.NF_ALM_USUARIOS_SOLCollection = NF_ALM_USUARIOS_SOLCollection;
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], udoUsuario, infoUsuarioSAP.value[0].InternalKey, 'PUT');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar las areas del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                    }
                }
                if (!error) {
                    let resultDeleteAreasUserMSQL = yield helpers_1.default.deleteAreasUserMSQL(areas);
                    if (resultDeleteAreasUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al elimminar las areas del usuario en mysql";
                    }
                    else {
                        message = "Se ha eliminado correctamente las areas seleccionadas";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    eliminarDependenciasUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                //console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let dependencias = data.dependencias;
                let error = false;
                let message = "";
                let iddependencias = dependencias.map((dependencia) => {
                    return dependencia.id;
                });
                console.log(dependencias, iddependencias);
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);
                console.log(udoUsuario);
                if (udoUsuario.error) {
                }
                else {
                    let NF_ALM_USUARIOS_VICCollection = [];
                    for (let dependenciasUDO of udoUsuario.NF_ALM_USUARIOS_VICCollection) {
                        if (dependencias.filter((dependencia) => dependencia.vicepresidency == dependenciasUDO.U_NF_DIM3_VICE && dependencia.dependence == dependenciasUDO.U_NF_DIM2_DEP && dependencia.location == dependenciasUDO.U_NF_DIM1_LOC).length == 0) {
                            NF_ALM_USUARIOS_VICCollection.push(dependenciasUDO);
                        }
                    }
                    //console.log(NF_ALM_USUARIOS_VICCollection);
                    udoUsuario.NF_ALM_USUARIOS_VICCollection = NF_ALM_USUARIOS_VICCollection;
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], udoUsuario, infoUsuarioSAP.value[0].InternalKey, 'PUT');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar las dependencias del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                    }
                }
                if (!error) {
                    let resultDeleteDependenciasUserMSQL = yield helpers_1.default.deleteDependenciasUserMSQL(dependencias);
                    if (resultDeleteDependenciasUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al elimminar las dependencias del usuario en mysql";
                    }
                    else {
                        message = "Se ha eliminado correctamente las dependencias seleccionadas";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    adicionarAlmacenUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let almacenes = data.almacenes;
                let error = false;
                let message = "";
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioSL(infoUsuario[0], codusersap);
                console.log(udoUsuario);
                let NF_ALM_USUARIOS_DETCollection = [];
                let almacenUser = [];
                let lineAlmacenUser = [];
                for (let almacen of almacenes) {
                    NF_ALM_USUARIOS_DETCollection.push({
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Object": "USU",
                        "U_NF_ALMACEN": almacen.WarehouseCode
                    });
                    lineAlmacenUser.push(codusersap);
                    lineAlmacenUser.push(almacen.WarehouseCode);
                    lineAlmacenUser.push(infoUsuario[0].id_company);
                    lineAlmacenUser.push(userid);
                    almacenUser.push(lineAlmacenUser);
                    lineAlmacenUser = [];
                    console.log(almacenUser);
                }
                if (udoUsuario.value.length > 0) {
                    //Registrar areas en udo de areas
                    let dataUdoAlmacenes = {
                        NF_ALM_USUARIOS_DETCollection
                    };
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], dataUdoAlmacenes, udoUsuario.value[0].USU.Code, 'PATCH');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar las areas del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                    }
                }
                else {
                    //Crear udo para usuario en SAP
                    let dataUdo = {
                        "Code": infoUsuarioSAP.value[0].InternalKey,
                        "Name": null,
                        "Canceled": "N",
                        "Object": "USU",
                        "UserSign": infoUsuarioSAP.value[0].InternalKey,
                        "DataSource": "I",
                        "U_NF_COD_USUARIO": infoUsuarioSAP.value[0].InternalKey,
                        "U_NF_NOM_USUARIO": infoUsuarioSAP.value[0].UserName,
                        NF_ALM_USUARIOS_DETCollection
                    };
                    let resultNewUdo = yield helpers_1.default.registerUdoSAPSL(infoUsuario[0], dataUdo);
                    console.log('resultNewUdo', resultNewUdo);
                    if (resultNewUdo != 201) {
                        //Error al crear UDO
                        error = true;
                        message = "Ocurio un error al crear el UDO del usuario en SAP";
                    }
                    else {
                        //Creación del UDO exitos, registrar en MYSQL las nuevas areas
                    }
                }
                if (!error) {
                    let resultRegisterAlmacenesUserMSQL = yield helpers_1.default.RegisterAlmacenesUserMSQL(almacenUser);
                    if (resultRegisterAlmacenesUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al registrar los almacenes del usuario en mysql";
                    }
                    else {
                        message = "Se ha registrado correctamente los almacenes seleccionados";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    elimnarAlmacenUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                let jwt = req.headers.authorization || '';
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const bdmysql = infoUsuario[0].bdmysql;
                const compania = infoUsuario[0].dbcompanysap;
                //******************************************************* */
                const data = req.body;
                //console.log(data);
                let codusersap = data.usuario;
                let userid = data.userid;
                let almacenes = data.almacenes;
                let error = false;
                let message = "";
                let idalmacenes = almacenes.map((area) => {
                    return area.id;
                });
                console.log(almacenes, idalmacenes);
                //validar si el usuario tiene udo creado en SAP
                const infoUsuarioSAP = yield helpers_1.default.getUsuarioSAPSL(infoUsuario[0], codusersap);
                const udoUsuario = yield helpers_1.default.udoUsuarioByIDSL(infoUsuario[0], infoUsuarioSAP.value[0].InternalKey);
                console.log(udoUsuario);
                if (udoUsuario.error) {
                }
                else {
                    let NF_ALM_USUARIOS_DETCollection = [];
                    for (let almacenesUDO of udoUsuario.NF_ALM_USUARIOS_DETCollection) {
                        if (almacenes.filter((almacen) => almacen.store == almacenesUDO.U_NF_ALMACEN).length == 0) {
                            NF_ALM_USUARIOS_DETCollection.push(almacenesUDO);
                        }
                    }
                    console.log(NF_ALM_USUARIOS_DETCollection);
                    udoUsuario.NF_ALM_USUARIOS_DETCollection = NF_ALM_USUARIOS_DETCollection;
                    let resultUpdateUdo = yield helpers_1.default.updateUdoSAPSL(infoUsuario[0], udoUsuario, infoUsuarioSAP.value[0].InternalKey, 'PUT');
                    console.log('resultUpdateUdo', resultUpdateUdo);
                    if (resultUpdateUdo != 204) {
                        //Error updated areas
                        error = true;
                        message = "Ocurio un error al actualizar los almacenes del UDO en SAP";
                    }
                    else {
                        //Actualización exitosa, registrar en MYSQL las nuevas areas
                        message = "Se actualizaron correctamente los almacenes seleccionados en el UDO SAP";
                    }
                }
                if (!error) {
                    let resultDeleteAreasUserMSQL = yield helpers_1.default.deleteAlmacenesUserMSQL(almacenes);
                    if (resultDeleteAreasUserMSQL.error) {
                        error = true;
                        message = "Ocurio un error al elimminar los almacenes del usuario en mysql";
                    }
                    else {
                        message = "Se ha eliminado correctamente los almacenes seleccionadas";
                    }
                }
                res.json({ error, message });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const userController = new UserController();
exports.default = userController;
