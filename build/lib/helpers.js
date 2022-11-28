"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const database_1 = require("../database");
const mailer_1 = __importDefault(require("./mailer"));
class Helpers {
    encryptPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hash = yield bcryptjs_1.default.hash(password, salt);
            return hash;
        });
    }
    matchPassword(password, savePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bcryptjs_1.default.compare(password, savePassword);
            }
            catch (error) {
                let now = new Date();
                console.log(error, " ", now);
            }
        });
    }
    generateToken(payload, expire = '12h') {
        return __awaiter(this, void 0, void 0, function* () {
            const signInOptions = {
                // RS256 uses a public/private key pair. The API provides the private key
                // to generate the JWT. The client gets a public key to validate the
                // signature
                //algorithm: 'RS256',
                expiresIn: expire
            };
            //Configuara secretkey con llave publica y privada generada con openssl
            //temporalmente sera secretkey
            return jsonwebtoken_1.default.sign(payload, 'secreetkey', signInOptions);
        });
    }
    validateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verifyOptions = {
                    algorithms: ['RS256'],
                };
                return yield (0, jsonwebtoken_1.verify)(token, 'secreetkey');
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    validateRoute(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(url);
            const routesAllowWithoutToken = [
                '/api/auth/login',
                '/api/auth/recovery',
                '/api/atuh/restore',
                '/',
                '/api/companies/listActive',
                '/api/permisos/list',
                '/api/compras/solped/aprobar/',
                '/api/compras/solped/rechazar/',
                '/api/compras/solped/upload/',
                '/api/compras/solped/borrar-anexo/',
                '/api/nitroLQ/titulos',
                '/api/nitroLQ/titulos/pagos'
            ];
            let result = false;
            for (let item of routesAllowWithoutToken) {
                if (url.includes(item)) {
                    result = true;
                }
            }
            return result;
        });
    }
    loginWsSAP(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonLog = { "CompanyDB": infoUsuario.dbcompanysap, "UserName": "ABALLESTEROS", "Password": "1234" };
            const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Login`;
            const configWs = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonLog)
            };
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                const data = yield response.json();
                if (response.ok) {
                    //console.log('successfully logged SAP');
                    return response.headers.get('set-cookie');
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    logoutWsSAP(bieSession) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Logout`;
            const configWs = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `${bieSession}`
                }
            };
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                //const data = await response.json();
                if (response.ok) {
                    return 'ok';
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getInfoUsuario(userid, company) {
        return __awaiter(this, void 0, void 0, function* () {
            const infoUsuario = yield database_1.db.query(`
        SELECT t0.id, fullname, email, username, codusersap, t0.status, 
            id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap  ,nit, direccion, telefono
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`, [userid, company]);
            return infoUsuario;
        });
    }
    getPermisoUsuario(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            const permisosUsuario = yield database_1.db.query(`SELECT * 
                                                        FROM perfil_menu_accions t0 
                                                        INNER JOIN  perfiles t1 ON t1.id = t0.id_perfil
                                                        INNER JOIN menu t2 ON t2.id = t0.id_menu
                                                        WHERE t0.id_perfil IN (SELECT tt0.id_perfil FROM perfil_users tt0 WHERE tt0.id_user = ?)`, [userid]);
            return permisosUsuario;
        });
    }
    getPerfilesUsuario(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            const perfilesUsuario = yield database_1.db.query(`SELECT t0.id, t0.perfil 
                                                FROM perfiles t0 
                                                INNER JOIN perfil_users t1 ON t1.id_perfil = t0.id 
                                                WHERE t1.id_user = ?`, [userid]);
            return perfilesUsuario;
        });
    }
    getMenuUsuario(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            const opcionesMenu = yield database_1.db.query(`SELECT t0.* 
        FROM menu t0 
        INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
        WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
            t0.hierarchy ='P' AND
            t1.read_accion = true
        ORDER BY t0.ordernum ASC;`, [userid]);
            const opcionesSubMenu = yield database_1.db.query(`SELECT t0.* 
            FROM menu t0 
            INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
            WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                t0.hierarchy ='H' AND
                t1.read_accion = true AND
                t0.visible =1
            ORDER BY t0.ordernum ASC;`, [userid]);
            let menuUsuario = {
                opcionesMenu,
                opcionesSubMenu
            };
            return menuUsuario;
        });
    }
    format(strDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputDate = new Date(strDate);
            let date, month, year;
            date = inputDate.getDate();
            month = inputDate.getMonth() + 1;
            year = inputDate.getFullYear();
            date = date
                .toString()
                .padStart(2, '0');
            month = month
                .toString()
                .padStart(2, '0');
            return `${year}-${month}-${date}`;
        });
    }
    getSolpedById(idSolped, bdmysql) {
        return __awaiter(this, void 0, void 0, function* () {
            const solpedResult = yield database_1.db.query(`
      
        SELECT T0.*, T1.*, T2.email 
        FROM ${bdmysql}.solped T0 
        INNER JOIN ${bdmysql}.solped_det T1 ON T0.id = T1.id_solped 
        INNER JOIN usuariosportal.users T2 ON T2.id = T0.id_user
        WHERE T0.id = ?`, [idSolped]);
            //console.log((solpedResult));
            let solped = {
                id: idSolped,
                id_user: solpedResult[0].id_user,
                usersap: solpedResult[0].usersap,
                fullname: solpedResult[0].fullname,
                serie: solpedResult[0].serie,
                doctype: solpedResult[0].doctype,
                status: solpedResult[0].status,
                sapdocnum: solpedResult[0].sapdocnum,
                docdate: solpedResult[0].docdate,
                docduedate: solpedResult[0].docduedate,
                taxdate: solpedResult[0].taxdate,
                reqdate: solpedResult[0].reqdate,
                u_nf_depen_solped: solpedResult[0].u_nf_depen_solped,
                approved: solpedResult[0].approved,
                comments: solpedResult[0].comments,
                trm: solpedResult[0].trm,
                u_nf_status: solpedResult[0].u_nf_status,
                nf_lastshippping: solpedResult[0].nf_lastshippping,
                nf_dateofshipping: solpedResult[0].nf_dateofshipping,
                nf_agente: solpedResult[0].nf_agente,
                nf_pago: solpedResult[0].nf_pago,
                nf_tipocarga: solpedResult[0].nf_tipocarga,
                nf_puertosalida: solpedResult[0].nf_puertosalida,
                nf_motonave: solpedResult[0].nf_motonave,
                nf_pedmp: solpedResult[0].nf_pedmp,
                nf_Incoterms: solpedResult[0].nf_Incoterms
            };
            let solpedDet = [];
            for (let item of solpedResult) {
                solpedDet.push({
                    id_solped: item.id_solped,
                    linenum: item.linenum,
                    linestatus: item.linestatus,
                    itemcode: item.itemcode,
                    dscription: item.dscription,
                    reqdatedet: item.reqdatedet,
                    linevendor: item.linevendor,
                    acctcode: item.acctcode,
                    acctcodename: item.acctcodename,
                    quantity: item.quantity,
                    moneda: item.moneda,
                    trm: item.trm,
                    price: item.price,
                    linetotal: item.linetotal,
                    tax: item.tax,
                    taxvalor: item.taxvalor,
                    linegtotal: item.linegtotal,
                    ocrcode: item.ocrcode,
                    ocrcode2: item.ocrcode2,
                    ocrcode3: item.ocrcode3,
                    whscode: item.whscode,
                    id_user: item.id_user,
                    zonecode: item.zonecode
                });
            }
            const anexosSolpedResult = yield database_1.db.query(`SELECT * FROM ${bdmysql}.anexos t0 WHERE t0.id_solped =  ?`, [idSolped]);
            let solpedObject = {
                solped,
                solpedDet,
                anexos: anexosSolpedResult
            };
            return solpedObject;
        });
    }
    getNextLineAprovedSolped(idSolped, bdmysql, companysap, logo, origin = 'http://localhost:4200', idLinea) {
        return __awaiter(this, void 0, void 0, function* () {
            let condicionLinea = "";
            if (idLinea)
                condicionLinea = ` and t0.id!=${idLinea}`;
            const queryNextApprovedLine = `
        SELECT *
        FROM ${bdmysql}.aprobacionsolped t0
        WHERE t0.id_solped = ${idSolped} AND t0.estadoseccion = 'A' AND t0.estadoap='P' ${condicionLinea}
        ORDER BY nivel ASC`;
            console.log(queryNextApprovedLine);
            const nextLineAprovedSolped = yield database_1.db.query(queryNextApprovedLine);
            console.log(nextLineAprovedSolped);
            console.log(nextLineAprovedSolped.length);
            //console.log(nextLineAprovedSolped[0].id);
            let lineAprovedSolped;
            if (nextLineAprovedSolped.length > 0) {
                lineAprovedSolped = {
                    autor: {
                        fullname: nextLineAprovedSolped[0].nombreautor,
                        email: nextLineAprovedSolped[0].emailautor,
                    },
                    aprobador: {
                        fullname: nextLineAprovedSolped[0].nombreaprobador,
                        email: nextLineAprovedSolped[0].emailaprobador,
                        usersap: nextLineAprovedSolped[0].usersapaprobador,
                    },
                    infoSolped: {
                        id_solped: idSolped,
                        idlineap: nextLineAprovedSolped[0].id,
                        bdmysql,
                        companysap,
                        logo,
                        origin
                    }
                };
            }
            else {
                lineAprovedSolped = '';
            }
            console.log(lineAprovedSolped);
            return lineAprovedSolped;
        });
    }
    sendNotification(infoEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log(infoEmail);
            let mailer = mailer_1.default.getTransporter();
            (yield mailer).sendMail({
                from: `"Notificaciones NitroPortal" <${mailer_1.default.emailsend}>`,
                to: infoEmail.to,
                //to: `ralbor@nitrofert.com.co`,
                //cc: `ralbor@nitrofert.com.co`,
                cc: infoEmail.cc,
                subject: infoEmail.subject,
                html: infoEmail.html,
                headers: { 'x-myheader': 'test header' }
            }, function (error, info) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Email Send");
                    }
                });
            });
        });
    }
    testSendMail() {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = yield mailer_1.default.getTransporter();
            transporter.sendMail({
                from: `"Notificaciones NitroPortal" <${mailer_1.default.emailsend}>`,
                to: "ralbor@nitrofert.com.co",
                subject: "Hello from nitrosap",
                text: "Hello nitrosap?",
                html: "<strong>Hello nitrosap?</strong>",
                headers: { 'x-myheader': 'test header' }
            });
        });
    }
    DetalleAprobacionSolped(idSolped, bdmysql) {
        return __awaiter(this, void 0, void 0, function* () {
            const detalleAprobacionSolped = yield database_1.db.query(`
        SELECT t0.id,
               t0.id_solped,
               t0.iduserautor, 
               t0.usersapautor, 
               t0.emailautor, 
               t0.nombreautor,
               t0.area,
               t0.condicion,
               t0.usersapaprobador,
               t0.emailaprobador,
               t0.nombreaprobador,
               t0.nivel,
               t0.estadoap,
               t0.estadoseccion,
               t0.created_at,
               t0.updated_at,
               t0.comments
        FROM ${bdmysql}.aprobacionsolped t0
        WHERE id_solped = ? AND estadoseccion = 'A' and estadoap !='P'
        ORDER BY nivel ASC`, [idSolped]);
            console.log((detalleAprobacionSolped));
            return detalleAprobacionSolped;
        });
    }
    loadBodyMailSolpedAp(LineAprovedSolped, logo, solped, key, urlbk, accionAprobacion) {
        return __awaiter(this, void 0, void 0, function* () {
            const solpedDet = solped.solpedDet;
            const anexosSolped = solped.anexos;
            let subtotal = 0;
            let totalimpuesto = 0;
            let total = 0;
            const detalleAprobacionSolped = yield helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
            let htmlDetalleAprobacion = '';
            let lineaDetalleAprobacion = '';
            //if (detalleAprobacionSolped.length > 0) {
            for (let item of detalleAprobacionSolped) {
                lineaDetalleAprobacion = lineaDetalleAprobacion + `
                                            <tr>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.nombreaprobador}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.estadoap === 'A' ? 'Aprobado' : 'Rechazado'}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.updated_at.toLocaleString()}</span>
                                                </td>
                                            </tr>
                `;
            }
            lineaDetalleAprobacion = lineaDetalleAprobacion + `
                                            <tr>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${LineAprovedSolped.aprobador.fullname}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">Aprobado</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${new Date().toLocaleString()}</span>
                                                </td>
                                            </tr>
                `;
            if (accionAprobacion) {
                htmlDetalleAprobacion = `<tr>
                                            <td style="border:2px solid #000000; padding: 10px;">
                                                <table align="center" style="width: 100%;">
                                                    <tr>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Usuario aprobador</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Estado aprobación</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Fecha aprobación</span>
                                                        </td>
                                                    </tr>
                                                    ${lineaDetalleAprobacion}
                                                </table>
                                            </td>
                                        </tr>`;
            }
            //}
            let lineaDetalleSolped = ``;
            for (let item of solpedDet) {
                subtotal = subtotal + item.linetotal;
                totalimpuesto = totalimpuesto + item.taxvalor;
                total = total + item.linegtotal;
                lineaDetalleSolped = lineaDetalleSolped + `
                                                    <tr>
                                                        
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.linenum}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.dscription}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.quantity}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.moneda} ${item.price}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.trm}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linetotal}</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.taxvalor}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linegtotal}</span>
                                                        </td>
                                                    </tr>
            `;
            }
            let anexos = ``;
            for (let anexo of anexosSolped) {
                anexos = anexos + `<tr>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.tipo}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.nombre}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;"><a href="${urlbk}/${anexo.ruta}" target="blank">Descargar anexo</a></span>
                                </td>
                              </tr>`;
            }
            let detalleSolped = `
                                        <tr>
                                            <td style="border:2px solid #000000; padding: 10px;">
                                                <table style="width:100%; width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                    <tr style="background-color: #3dae2b; color:#454444;">
                                                        
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Línea</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Descripción</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Cantidad</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Valor</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">TRM</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Subtotal línea</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Impuesto</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Total línea</span>
                                                        </td>
                                                    </tr>

                                                    ${lineaDetalleSolped}

                                                </table>
                                            </td>
                                        </tr>`;
            let bottonsAproved = "";
            if (key !== '') {
                bottonsAproved = `<table>
                                    <tr>
                                        <td><a href="${urlbk}/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">Aprobar</a></td>
                                        
                                        <td><a href="${urlbk}/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a></td>
                                    </tr>
                                </table>`;
            }
            const html = `<!DOCTYPE html>
        <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <body style="margin:0;padding:0;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:0;">
                            <table role="presentation"
                                style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                                <tr>
                                    <td align="center" style="padding:40px 0 30px 0;background:#ffffff;border:2px solid #000000">
                                        <img src="${logo}" alt="" width="50%"  style="height:auto;display:block;" /> 
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:36px 30px 42px 30px;border:2px solid #000000">
                                        <table
                                            style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <h1>Solicitud de aprobación Solped ${solped.solped.id}</h1>
                                                    <p> Hola ${LineAprovedSolped.aprobador.fullname} el usuario ${LineAprovedSolped.autor.fullname}
                                                        ha solicitado la aprobación de la solped # ${solped.solped.id}
                                                    </p>
                                                    <p>
                                                        A continuación podrá ver la información solped
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                        <tr>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Usuario solicitante</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.fullname}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Area solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.u_nf_depen_solped}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller;padding-left: 2px;">Calse solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.doctype === 'S' ? 'Servicio' : 'Articulo'}</span><br />
                                                                
                                                            </td>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Tipo solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.serie}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha contabilización / Fecha expira </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.docdate.toLocaleString()} - ${solped.solped.docduedate.toLocaleString()}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha ducumento / Fecha necesaria </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.taxdate.toLocaleString()} - ${solped.solped.reqdate.toLocaleString()}</span><br />
                                                            </td>
                                                        </tr>
                                                        
                                                    </table>
                                                    <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Comentarios</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.comments}</span>
                                                </td>
                                            </tr>
                                            ${detalleSolped}
                                            <tr>
                                                <td style="border:2px solid #000000; padding: 10px;">
                                                        <table align="right">
                                                            <tr>
                                                                <td style="width: 60%;"><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Subtotal</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${subtotal}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total impuestos</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${totalimpuesto}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total solped</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${total}</span></td>
                                                            </tr>
                                                        </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="border:2px solid #000000; padding: 10px;">
                                                    <table align="center" style="width:100%;">
                                                        <tr>
                                                            <td colspan="3"><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Anexos</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Tipo</span></td>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Nombre anexo</span></td>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;"></span></td>
                                                        </tr>
                                                        ${anexos}
                                                    </table>
                                                </td>
                                            </tr>
                                            ${htmlDetalleAprobacion}
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:30px;background:url(https://nitrofert.com.co/wp-content/uploads/2022/01/Fondo-home-nitrofert-3-2.jpg) repeat;border:2px solid #000000">
                                        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                            <tr>
                                                <td style="padding:0;width:50%;" align="left">
                                                    <p>&reg; Nitro Portal, TI 2022<br/><a href="http://localhost:4200/">Nitroportal</a></p>
                                                </td>
                                                <td style="padding:0;width:50%;" align="right">
                                                    ${bottonsAproved}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            <style>
                table, td, div, h1, p {font-family: Arial, sans-serif;}
                
            </style>
        </head>
        </html>`;
            return html;
        });
    }
    loadBodyMailApprovedSolped(LineAprovedSolped, logo, solped, key, urlbk, accionAprobacion) {
        return __awaiter(this, void 0, void 0, function* () {
            const solpedDet = solped.solpedDet;
            const anexosSolped = solped.anexos;
            let subtotal = 0;
            let totalimpuesto = 0;
            let total = 0;
            const detalleAprobacionSolped = yield helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
            let htmlDetalleAprobacion = '';
            let lineaDetalleAprobacion = '';
            //if (detalleAprobacionSolped.length > 0) {
            for (let item of detalleAprobacionSolped) {
                lineaDetalleAprobacion = lineaDetalleAprobacion + `
                                            <tr>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.nombreaprobador}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.estadoap === 'A' ? 'Aprobado' : 'Rechazado'}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.updated_at.toLocaleString()}</span>
                                                </td>
                                            </tr>
                `;
            }
            lineaDetalleAprobacion = lineaDetalleAprobacion + `
                                            <tr>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${LineAprovedSolped.aprobador.fullname}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">Aprobado</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${new Date().toLocaleString()}</span>
                                                </td>
                                            </tr>
                `;
            if (accionAprobacion) {
                htmlDetalleAprobacion = `<tr>
                                            <td style="border:2px solid #000000; padding: 10px;">
                                                <table align="center" style="width: 100%;">
                                                    <tr>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Usuario aprobador</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Estado aprobación</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Fecha aprobación</span>
                                                        </td>
                                                    </tr>
                                                    ${lineaDetalleAprobacion}
                                                </table>
                                            </td>
                                        </tr>`;
            }
            //}
            let lineaDetalleSolped = ``;
            for (let item of solpedDet) {
                subtotal = subtotal + item.linetotal;
                totalimpuesto = totalimpuesto + item.taxvalor;
                total = total + item.linegtotal;
                lineaDetalleSolped = lineaDetalleSolped + `
                                                    <tr>
                                                        
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.linenum}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.dscription}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.quantity}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.moneda} ${item.price}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.trm}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linetotal}</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.taxvalor}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linegtotal}</span>
                                                        </td>
                                                    </tr>
            `;
            }
            let anexos = ``;
            for (let anexo of anexosSolped) {
                anexos = anexos + `<tr>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.tipo}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.nombre}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;"><a href="${urlbk}/${anexo.ruta}" target="blank">Descargar anexo</a></span>
                                </td>
                              </tr>`;
            }
            let detalleSolped = `
                                        <tr>
                                            <td style="border:2px solid #000000; padding: 10px;">
                                                <table style="width:100%; width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                    <tr style="background-color: #3dae2b; color:#454444;">
                                                        
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Línea</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Descripción</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Cantidad</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Valor</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">TRM</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Subtotal línea</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Impuesto</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Total línea</span>
                                                        </td>
                                                    </tr>

                                                    ${lineaDetalleSolped}

                                                </table>
                                            </td>
                                        </tr>`;
            let bottonsAproved = "";
            if (key !== '') {
                bottonsAproved = `<table>
                                    <tr>
                                        <td><a href="${urlbk}/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: darkblue;">Aprobar</a></td>
                                        
                                        <td><a href="${urlbk}/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: #ffffff;">Rechazar</a></td>
                                    </tr>
                                </table>`;
            }
            const html = `<!DOCTYPE html>
        <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <body style="margin:0;padding:0;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:0;">
                            <table role="presentation"
                                style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                                <tr>
                                    <td align="center" style="padding:40px 0 30px 0;background:#ffffff;border:2px solid #000000">
                                        <img src="${logo}" alt="" width="50%"  style="height:auto;display:block;" /> 
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:36px 30px 42px 30px;border:2px solid #000000">
                                        <table
                                            style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <h1>Notificación de aprobación  de solped # ${solped.solped.id}</h1>
                                                    <p> Hola ${LineAprovedSolped.autor.fullname} el usuario ${LineAprovedSolped.aprobador.fullname}
                                                        ha aprobado la solped # ${solped.solped.id} y se genero el documento # ${LineAprovedSolped.infoSolped.sapdocnum} en SAP
                                                    </p>
                                                    <p>
                                                        A continuación podrá ver la información solped
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                        <tr>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Usuario solicitante</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.fullname}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Area solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.u_nf_depen_solped}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller;padding-left: 2px;">Calse solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.doctype === 'S' ? 'Servicio' : 'Articulo'}</span><br />
                                                                
                                                            </td>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Tipo solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.serie}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha contabilización / Fecha expira </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.docdate.toLocaleString()} - ${solped.solped.docduedate.toLocaleString()}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha ducumento / Fecha necesaria </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.taxdate.toLocaleString()} - ${solped.solped.reqdate.toLocaleString()}</span><br />
                                                            </td>
                                                        </tr>
                                                        
                                                    </table>
                                                    <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Comentarios</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.comments}</span>
                                                </td>
                                            </tr>
                                            ${detalleSolped}
                                            <tr>
                                                <td style="border:2px solid #000000; padding: 10px;">
                                                        <table align="right">
                                                            <tr>
                                                                <td style="width: 60%;"><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Subtotal</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${subtotal}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total impuestos</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${totalimpuesto}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total solped</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${total}</span></td>
                                                            </tr>
                                                        </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="border:2px solid #000000; padding: 10px;">
                                                    <table align="center" style="width:100%;">
                                                        <tr>
                                                            <td colspan="3"><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Anexos</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Tipo</span></td>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Nombre anexo</span></td>
                                                            <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;"></span></td>
                                                        </tr>
                                                        ${anexos}
                                                    </table>
                                                </td>
                                            </tr>
                                            ${htmlDetalleAprobacion}
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:30px;background:url(https://nitrofert.com.co/wp-content/uploads/2022/01/Fondo-home-nitrofert-3-2.jpg) repeat;border:2px solid #000000">
                                        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                            <tr>
                                                <td style="padding:0;width:50%;" align="left">
                                                    <p>&reg; Nitro Portal, TI 2022<br/><a href="http://localhost:4200/">Nitroportal</a></p>
                                                </td>
                                                <td style="padding:0;width:50%;" align="right">
                                                    ${bottonsAproved}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            <style>
                table, td, div, h1, p {font-family: Arial, sans-serif;}
                
            </style>
        </head>
        </html>`;
            return html;
        });
    }
    loadBodyMailRejectSolped(LineAprovedSolped, logo, solped) {
        return __awaiter(this, void 0, void 0, function* () {
            const solpedDet = solped.solpedDet;
            let subtotal = 0;
            let totalimpuesto = 0;
            let total = 0;
            const detalleAprobacionSolped = yield helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
            let htmlDetalleAprobacion = '';
            let lineaDetalleAprobacion = '';
            if (detalleAprobacionSolped.length > 0) {
                for (let item of detalleAprobacionSolped) {
                    lineaDetalleAprobacion = lineaDetalleAprobacion + `
                                            <tr>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.nombreaprobador}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.estadoap === 'A' ? 'Aprobado' : 'Rechazado'}</span>
                                                </td>
                                                <td>
                                                    <span style="font-size:smaller;padding-left: 3px;">${item.updated_at.toLocaleString()}</span>
                                                </td>
                                            </tr>
                `;
                }
                htmlDetalleAprobacion = `<tr>
                                        <td style="border:2px solid #000000; padding: 10px;">
                                            <table align="center" style="width: 100%;">
                                                <tr>
                                                    <td>
                                                        <span style="font-weight: bold; font-size: small; padding-left: 2px;">Usuario aprobador</span>
                                                    </td>
                                                    <td>
                                                        <span style="font-weight: bold; font-size: small; padding-left: 2px;">Estado aprobación</span>
                                                    </td>
                                                    <td>
                                                        <span style="font-weight: bold; font-size: small; padding-left: 2px;">Fecha aprobación</span>
                                                    </td>
                                                </tr>
                                                ${lineaDetalleAprobacion}
                                            </table>
                                        </td>
                                    </tr>`;
            }
            let lineaDetalleSolped = ``;
            for (let item of solpedDet) {
                subtotal = subtotal + item.linetotal;
                totalimpuesto = totalimpuesto + item.taxvalor;
                total = total + item.linegtotal;
                lineaDetalleSolped = lineaDetalleSolped + `
                                                    <tr>
                                                        
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.linenum}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.dscription}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.quantity}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.moneda} ${item.price}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.trm}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linetotal}</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.taxvalor}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linegtotal}</span>
                                                        </td>
                                                    </tr>
            `;
            }
            let detalleSolped = `
                                        <tr>
                                            <td style="border:2px solid #000000; padding: 10px;">
                                                <table style="width:100%; width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                    <tr style="background-color: #3dae2b; color:#454444;">
                                                        
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Línea</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Descripción</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Cantidad</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Valor</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">TRM</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Subtotal línea</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Impuesto</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-weight: bold; font-size: small; padding-left: 2px;">Total línea</span>
                                                        </td>
                                                    </tr>

                                                    ${lineaDetalleSolped}

                                                </table>
                                            </td>
                                        </tr>`;
            const html = `<!DOCTYPE html>
        <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <body style="margin:0;padding:0;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:0;">
                            <table role="presentation"
                                style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                                <tr>
                                    <td align="center" style="padding:40px 0 30px 0;background:#ffffff;border:2px solid #000000">
                                        <img src="${logo}" alt="" width="50%"  style="height:auto;display:block;" /> 
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:36px 30px 42px 30px;border:2px solid #000000">
                                        <table
                                            style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <h1>Notificación de rechazo solped # ${solped.solped.id}</h1>
                                                    <p> Hola ${LineAprovedSolped.autor.fullname} el usuario ${LineAprovedSolped.aprobador.fullname}
                                                        ha rechazado la solicitud de aprobación de la solped # ${solped.solped.id}
                                                    </p>
                                                    <p>
                                                        ${LineAprovedSolped.infoSolped.comments}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="border:2px solid #000000">
                                                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                                        <tr>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Usuario solicitante</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.fullname}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Area solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.u_nf_depen_solped}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller;padding-left: 2px;">Calse solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.doctype === 'S' ? 'Servicio' : 'Articulo'}</span><br />
                                                                
                                                            </td>
                                                            <td style="width:50%;">
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Tipo solicitud</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.serie}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha contabilización / Fecha expira </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.docdate.toLocaleString()} - ${solped.solped.docduedate.toLocaleString()}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha ducumento / Fecha necesaria </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.taxdate.toLocaleString()} - ${solped.solped.reqdate.toLocaleString()}</span><br />
                                                            </td>
                                                        </tr>
                                                        
                                                    </table>
                                                    <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Comentarios</span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${solped.solped.comments}</span>
                                                </td>
                                            </tr>
                                            ${detalleSolped}
                                            <tr>
                                                <td style="border:2px solid #000000; padding: 10px;">
                                                        <table align="right">
                                                            <tr>
                                                                <td style="width: 60%;"><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Subtotal</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${subtotal}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total impuestos</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${totalimpuesto}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total solped</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${total}</span></td>
                                                            </tr>
                                                        </table>
                                                </td>
                                            </tr>
                                            ${htmlDetalleAprobacion}
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:30px;background:url(https://nitrofert.com.co/wp-content/uploads/2022/01/Fondo-home-nitrofert-3-2.jpg) repeat;border:2px solid #000000">
                                        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                                            <tr>
                                                <td style="padding:0;width:50%;" align="left">
                                                    <p>&reg; Nitro Portal, TI 2022<br/><a href="http://localhost:4200/">Nitroportal</a></p>
                                                </td>
                                                <td style="padding:0;width:50%;" align="right">
                                                   
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            <style>
                table, td, div, h1, p {font-family: Arial, sans-serif;}
                
            </style>
        </head>
        </html>`;
            return html;
        });
    }
    loadInfoSolpedToJSONSAP(Solped) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSolopedJSONSAP;
            let DocumentLines = [];
            let DocumentLine;
            for (let item of Solped.solpedDet) {
                DocumentLine = {
                    LineNum: item.linenum,
                    //Currency:item.trm===1?'$':item.moneda,
                    Currency: item.moneda === 'COP' ? '$' : item.moneda,
                    //Rate: item.trm,
                    ItemDescription: item.dscription,
                    RequiredDate: item.reqdatedet,
                    //LineTotal:item.linetotal,
                    //GrossTotal:item.linegtotal,
                    TaxCode: item.tax,
                    CostingCode: item.ocrcode,
                    CostingCode2: item.ocrcode2,
                    CostingCode3: item.ocrcode3,
                    WarehouseCode: item.whscode !== '' ? item.whscode : 'SM_N300'
                };
                if (item.itemcode !== '') {
                    DocumentLine.ItemCode = item.itemcode;
                }
                if (item.linevendor !== '') {
                    DocumentLine.LineVendor = item.linevendor;
                }
                if (item.acctcode !== '') {
                    DocumentLine.AccountCode = item.acctcode;
                }
                if (item.whscode === '') {
                    if (Solped.solped.serie === 'SPB') {
                        DocumentLine.WarehouseCode = 'SM_N300';
                    }
                }
                else {
                    DocumentLine.WarehouseCode = item.whscode;
                }
                if (Solped.solped.doctype == 'S') {
                    DocumentLine.LineTotal = item.linetotal;
                }
                else {
                    DocumentLine.Price = item.price,
                        DocumentLine.Quantity = item.quantity;
                }
                DocumentLine.TaxLiable = 'tYES';
                DocumentLine.U_ID_PORTAL = item.id_solped;
                DocumentLine.U_NF_NOM_AUT_PORTAL = Solped.solped.usersap;
                DocumentLines.push(DocumentLine);
            }
            dataSolopedJSONSAP = {
                Requester: Solped.solped.usersap,
                RequesterName: Solped.solped.fullname,
                U_NF_DEPEN_SOLPED: Solped.solped.u_nf_depen_solped,
                DocType: Solped.solped.doctype,
                Series: Solped.solped.serie,
                DocDate: Solped.solped.docdate,
                DocDueDate: Solped.solped.docduedate,
                TaxDate: Solped.solped.taxdate,
                RequriedDate: Solped.solped.reqdate,
                //DocRate: Solped.solped.trm,
                Comments: Solped.solped.comments,
                U_AUTOR_PORTAL: Solped.solped.usersap,
                //JournalMemo:Solped.solped.comments,
                DocumentLines
            };
            if (Solped.solped.u_nf_status != null) {
                dataSolopedJSONSAP.U_NF_STATUS = Solped.solped.u_nf_status == 'Proyectado' ? 'Solicitado' : Solped.solped.u_nf_status;
            }
            if (Solped.solped.nf_lastshippping != null) {
                dataSolopedJSONSAP.U_NF_LASTSHIPPPING = Solped.solped.nf_lastshippping;
            }
            if (Solped.solped.nf_dateofshipping != null) {
                dataSolopedJSONSAP.U_NF_DATEOFSHIPPING = Solped.solped.nf_dateofshipping;
            }
            if (Solped.solped.nf_agente != null) {
                dataSolopedJSONSAP.U_NF_AGENTE = Solped.solped.nf_agente;
            }
            if (Solped.solped.nf_pago != null) {
                dataSolopedJSONSAP.U_NF_PAGO = Solped.solped.nf_pago;
            }
            if (Solped.solped.nf_tipocarga != null) {
                dataSolopedJSONSAP.U_NF_TIPOCARGA = Solped.solped.nf_tipocarga;
            }
            if (Solped.solped.nf_puertosalida != null) {
                dataSolopedJSONSAP.U_NF_PUERTOSALIDA = Solped.solped.nf_puertosalida;
            }
            if (Solped.solped.nf_motonave != null) {
                dataSolopedJSONSAP.U_NF_MOTONAVE = Solped.solped.nf_motonave;
            }
            if (Solped.solped.nf_pedmp != null) {
                dataSolopedJSONSAP.U_NF_PEDMP = Solped.solped.nf_pedmp;
            }
            if (Solped.solped.nf_Incoterms != null) {
                dataSolopedJSONSAP.U_NT_Incoterms = Solped.solped.nf_Incoterms;
            }
            console.log(JSON.stringify(dataSolopedJSONSAP));
            return dataSolopedJSONSAP;
        });
    }
    registerSolpedSAP(infoUsuario, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                console.log(JSON.stringify(data));
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests`;
                    let configWs2 = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    updateSolpedSAP(infoUsuario, data, docEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${docEntry})`;
                    let configWs2 = {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    //const data2 = await response2.json();
                    console.log(response2);
                    helper.logoutWsSAP(bieSession);
                    return response2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    registerProcApSolpedSAP(infoUsuario, bdmysql, idSolped, docNumSAP) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let queryListAprobacionesSolped = `
                SELECT t0.id AS "key",t1.sapdocnum,t1.id, t0.updated_at,t0.nombreaprobador,t0.estadoap,t0.comments
                FROM ${bdmysql}.aprobacionsolped t0 
                INNER JOIN ${bdmysql}.solped t1 ON t1.id = t0.id_solped 
                WHERE t0.id_solped =${idSolped} and t0.estadoseccion='A'`;
                let resultListAprobacionesSolped = yield database_1.db.query(queryListAprobacionesSolped);
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/U_NF_APRO_SOLPED_WEB`;
                    let arrayResult = [];
                    let data;
                    for (let item of resultListAprobacionesSolped) {
                        data = { "Code": item.key,
                            "Name": item.key,
                            "U_NF_FECHA_APRO": item.updated_at,
                            "U_NF_NOM_APROB": item.nombreaprobador,
                            "U_NF_ESTADO_APRO": "A",
                            "U_NF_COM_AROB": item.comments,
                            "U_NF_NUM_SOLPED_WEB": item.id,
                            "U_NF_NUM_SOLPED_SAP": docNumSAP };
                        let configWs2 = {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                'cookie': bieSession || ''
                            },
                            body: JSON.stringify(data)
                        };
                        let response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                        let data2 = yield response2.json();
                        arrayResult.push(data2);
                        console.log(data2);
                    }
                    helper.logoutWsSAP(bieSession);
                    return arrayResult;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getEntradaById(idEntrada, bdmysql) {
        return __awaiter(this, void 0, void 0, function* () {
            const entradaResult = yield database_1.db.query(`
      
        SELECT T0.*, T1.*, T2.email 
        FROM ${bdmysql}.entrada T0 
        INNER JOIN ${bdmysql}.entrada_det T1 ON T0.id = T1.id_entrada 
        INNER JOIN usuariosportal.users T2 ON T2.id = T0.id_user
        WHERE t0.id = ?`, [idEntrada]);
            //console.log((solpedResult));
            let entrada = {
                id: idEntrada,
                id_user: entradaResult[0].id_user,
                usersap: entradaResult[0].usersap,
                fullname: entradaResult[0].fullname,
                Series: entradaResult[0].serie,
                DocType: entradaResult[0].doctype,
                status: entradaResult[0].status,
                sapdocnum: entradaResult[0].sapdocnum,
                DocDate: entradaResult[0].docdate,
                DocDueDate: entradaResult[0].docduedate,
                TaxDate: entradaResult[0].taxdate,
                reqdate: entradaResult[0].reqdate,
                CardCode: entradaResult[0].codigoproveedor,
                CardName: entradaResult[0].nombreproveedor,
                DocNum: entradaResult[0].pedidonumsap,
                Comments: entradaResult[0].comments,
                trm: entradaResult[0].trm,
                currency: entradaResult[0].currency
            };
            let entradaDet = [];
            let DocumentLines = [];
            for (let item of entradaResult) {
                entradaDet.push({
                    id_entrada: item.id_entrada,
                    LineNum: item.linenum,
                    LineStatus: item.linestatus === 'O' ? 'bost_Open' : 'bost_Close',
                    ItemCode: item.itemcode,
                    ItemDescription: item.dscription,
                    reqdatedet: item.reqdatedet,
                    AccountCode: item.acctcode,
                    cantidad: item.quantity,
                    Currency: item.moneda,
                    trm: item.trm,
                    Price: item.price,
                    LineTotal: item.linetotal,
                    TaxCode: item.tax,
                    TaxTotal: item.taxvalor,
                    linegtotal: item.linegtotal,
                    CostingCode: item.ocrcode,
                    CostingCode2: item.ocrcode2,
                    CostingCode3: item.ocrcode3,
                    WarehouseCode: item.whscode,
                    id_user: item.id_user,
                    BaseOpenQuantity: item.cantidad_pedido,
                    RemainingOpenQuantity: item.cantidad_pendiente,
                    BaseDocNum: item.basedocnum,
                    BaseEntry: item.baseentry,
                    BaseLine: item.baseline,
                    BaseType: item.basetype
                });
                DocumentLines.push({
                    id_entrada: item.id_entrada,
                    LineNum: item.linenum,
                    LineStatus: item.linestatus === 'O' ? 'bost_Open' : 'bost_Close',
                    ItemCode: item.itemcode,
                    ItemDescription: item.dscription,
                    reqdatedet: item.reqdatedet,
                    AccountCode: item.acctcode,
                    cantidad: item.quantity,
                    Currency: item.moneda,
                    trm: item.trm,
                    Price: item.price,
                    LineTotal: item.linetotal,
                    TaxCode: item.tax,
                    TaxTotal: item.taxvalor,
                    linegtotal: item.linegtotal,
                    CostingCode: item.ocrcode,
                    CostingCode2: item.ocrcode2,
                    CostingCode3: item.ocrcode3,
                    WarehouseCode: item.whscode,
                    id_user: item.id_user,
                    BaseOpenQuantity: item.cantidad_pedido,
                    RemainingOpenQuantity: item.cantidad_pendiente,
                    BaseDocNum: item.basedocnum,
                    BaseEntry: item.baseentry,
                    BaseLine: item.baseline,
                    BaseType: item.basetype
                });
            }
            let entradaObject = {
                entrada,
                entradaDet
            };
            let infoEntrada = {
                id: idEntrada,
                id_user: entradaResult[0].id_user,
                usersap: entradaResult[0].usersap,
                fullname: entradaResult[0].fullname,
                Series: entradaResult[0].serie,
                DocType: entradaResult[0].doctype,
                status: entradaResult[0].status,
                sapdocnum: entradaResult[0].sapdocnum,
                DocDate: entradaResult[0].docdate,
                DocDueDate: entradaResult[0].docduedate,
                TaxDate: entradaResult[0].taxdate,
                reqdate: entradaResult[0].reqdate,
                CardCode: entradaResult[0].codigoproveedor,
                CardName: entradaResult[0].nombreproveedor,
                DocNum: entradaResult[0].pedidonumsap,
                Comments: entradaResult[0].comments,
                trm: entradaResult[0].trm,
                currency: entradaResult[0].currency,
                DocumentLines
            };
            console.log(entradaObject, infoEntrada);
            return infoEntrada;
        });
    }
    loadInfoEntradaToJSONSAP(Entrada) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataEntradaJSONSAP;
            let DocumentLines = [];
            let DocumentLine;
            for (let item of Entrada.EntradaDet) {
                DocumentLine = {
                    //LineNum:item.linenum,
                    //Currency:item.trm===1?'$':item.moneda,
                    //Currency:item.moneda==='COP'?'$':item.moneda,
                    //Rate: item.trm,
                    ItemDescription: item.dscription,
                    //RequiredDate:item.reqdatedet,
                    Quantity: item.cantidad,
                    Price: item.precio,
                    //LineTotal:item.linetotal,
                    //GrossTotal:item.linegtotal,
                    TaxCode: item.tax,
                    CostingCode: item.ocrcode,
                    CostingCode2: item.ocrcode2,
                    CostingCode3: item.ocrcode3,
                    WarehouseCode: item.whscode !== '' ? item.whscode : 'SM_N300',
                    BaseType: item.BaseType,
                    BaseEntry: item.BaseEntry,
                    BaseLine: item.BaseLine
                };
                if (item.itemcode !== '') {
                    DocumentLine.ItemCode = item.itemcode;
                }
                if (item.acctcode !== '') {
                    DocumentLine.AccountCode = item.acctcode;
                }
                if (item.whscode === '') {
                    DocumentLine.WarehouseCode = 'SM_N300';
                }
                else {
                    DocumentLine.WarehouseCode = item.whscode;
                }
                DocumentLines.push(DocumentLine);
            }
            dataEntradaJSONSAP = {
                DocType: Entrada.entrada.doctype,
                Series: Entrada.entrada.serie,
                DocDate: Entrada.entrada.docdate,
                DocDueDate: Entrada.entrada.docduedate,
                TaxDate: Entrada.entrada.taxdate,
                //RequriedDate:Entrada.entrada.reqdate,
                CardCode: Entrada.entrada.codigoproveedor,
                CardName: Entrada.entrada.nombreproveedor,
                Comments: Entrada.entrada.comments,
                U_AUTOR_PORTAL: Entrada.entrada.usersap,
                DocumentLines
            };
            console.log(JSON.stringify(dataEntradaJSONSAP));
            return dataEntradaJSONSAP;
        });
    }
    registerEntradaSAP(infoUsuario, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseDeliveryNotes`;
                    let configWs2 = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getSolpedByIdSL(infoUsuario, DocNum, Serie) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${Serie} and DocNum eq ${DocNum}&$select=DocEntry, DocNum`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getEntradaByIdSL(infoUsuario, DocNum) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(DocNum);
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,BusinessPartners,PurchaseDeliveryNotes/DocumentLines,Users)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocDate,NumAtCard,DocTotal,VatSum,Comments),BusinessPartners($select=CardCode,CardName,FederalTaxID,City,ContactPerson,Phone1,EmailAddress,MailAddress),PurchaseDeliveryNotes/DocumentLines($select=LineNum,ItemCode,ItemDescription,Quantity,Price,Currency,Rate,TaxCode,TaxPercentagePerRow,TaxTotal,LineTotal,GrossTotal,WarehouseCode,CostingCode,CostingCode2,CostingCode3),Users($select=UserCode,UserName)&$filter=PurchaseDeliveryNotes/CardCode eq BusinessPartners/CardCode and PurchaseDeliveryNotes/DocNum eq ${DocNum} and PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and PurchaseDeliveryNotes/UserSign eq Users/InternalKey`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    // console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getSeriesXE(compania, objtype) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filtroObjtype = "";
                if (objtype)
                    filtroObjtype = `&tipodoc=${objtype}`;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                //console.log(data2);
                return (data2);
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getSolpedMPopenSL(infoUsuario, serie) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${serie} and DocumentStatus eq 'bost_Open' &$select=DocNum`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getAllSolpedMPopenSL(infoUsuario, serie) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${serie} and DocumentStatus eq 'bost_Open'`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    sumarDiasFecha(fecha, dias) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                fecha.setDate(fecha.getDate() + dias);
                return fecha;
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getOcMPByStatusSL(infoUsuario, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders?$filter=Series eq 92 and DocumentStatus eq 'bost_Open' and U_NF_STATUS eq '${status}'`;
                    console.log(url2);
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getEntradasMPSL(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseDeliveryNotes?$filter=U_NF_PEDMP eq 'S' and DocumentStatus eq 'bost_Open'`;
                    console.log(url2);
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getEntradasMPXE(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const compania = infoUsuario.dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsEntradasOpenMP.xsjs?compania=${compania}`;
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                return (data2);
            }
            catch (error) {
                console.error(error);
                return (error);
            }
        });
    }
    updatePedidoSAP(infoUsuario, data, docEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders(${docEntry})`;
                    let configWs2 = {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    //const data2 = await response2.json();
                    console.log(response2);
                    helper.logoutWsSAP(bieSession);
                    return response2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getInventariosMPXE(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const compania = infoUsuario.dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_INV_CALCU.xsjs?compania=${compania}`;
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                return (data2);
            }
            catch (error) {
                console.error(error);
                return (error);
            }
        });
    }
    getInventariosTrackingMPXE(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const compania = infoUsuario.dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_SOLPED_PEDIDOSMP.xsjs?compania=${compania}`;
                const response2 = yield (0, node_fetch_1.default)(url2);
                const data2 = yield response2.json();
                return (data2);
            }
            catch (error) {
                console.error(error);
                return (error);
            }
        });
    }
    getInventariosProyectados(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bdmysql = infoUsuario.bdmysql;
                const query = `SELECT 
            'Proyectado' AS "TIPO",
            '' AS "CardCode",
            t0.sapdocnum AS "DocNum",
            '' AS "DocCur",
            '' AS "BaseRef",
            t0.status AS "DocStatus",
            '' AS "CANCELED",
            t0.reqdate AS "FECHANECESIDAD",
            t0.nf_pedmp AS "U_NF_PEDMP",
            t0.nf_incoterms AS "U_NT_Incoterms",
            t0.reqdate AS "ETA", 
            t0.nf_lastshippping AS "U_NF_LASTSHIPPPING",
            t0.nf_dateofshipping AS "U_NF_DATEOFSHIPPING",
            t0.nf_agente AS "U_NF_AGENTE",
            t0.nf_puertosalida AS "U_NF_PUERTOSALIDA",
            t0.nf_motonave AS "U_NF_MOTONAVE",
            t0.u_nf_status AS "U_NF_STATUS",
            t1.linevendor AS "LineVendor",
            t1.itemcode AS "ItemCode",
            t1.whscode AS "WhsCode",
            t1.zonacode AS "State_Code",
            '' AS "PENTRADA",
            t1.quantity AS "Quantity",
            t1.price AS "Price",
            t1.trm AS "Rate",
            '' AS "OpenCreQty"
            
            FROM ${bdmysql}.solped t0 
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            WHERE t0.serie = 189 AND 
            t0.sapdocnum =0`;
                const solpeds = yield database_1.db.query(query);
                return (solpeds);
            }
            catch (error) {
                console.error(error);
                return (error);
            }
        });
    }
    covertirResultadoSLArray(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Convertir SL to array');
            let dataArray = [];
            let lineaArray;
            let lineaDetalleArray = [];
            for (let documento of data.value) {
                lineaArray = {
                    DocEntry: documento.DocEntry,
                    DocNum: documento.DocNum,
                    DocType: documento.DocType,
                    DocDate: documento.DocDate,
                    DocDueDate: documento.DocDueDate,
                    DocCurrency: documento.DocCurrency,
                    DocRate: documento.DocRate,
                    Reference1: documento.Reference1,
                    Comments: documento.Comments,
                    Series: documento.Series,
                    TaxDate: documento.TaxDate,
                    DocObjectCode: documento.DocObjectCode,
                    CreationDate: documento.CreationDate,
                    UpdateDate: documento.UpdateDate,
                    UserSign: documento.UserSign,
                    DocTotalFc: documento.DocTotalFc,
                    DocTotalSys: documento.DocTotalSys,
                    RequriedDate: documento.RequriedDate,
                    DocumentStatus: documento.DocumentStatus,
                    Requester: documento.Requester,
                    RequesterName: documento.RequesterName,
                    RequesterEmail: documento.RequesterEmail,
                    U_NF_AGENTE: documento.U_NF_AGENTE,
                    U_NF_DATEOFSHIPPING: documento.U_NF_DATEOFSHIPPING,
                    U_NF_LASTSHIPPPING: documento.U_NF_LASTSHIPPPING,
                    U_NF_MOTONAVE: documento.U_NF_MOTONAVE,
                    U_NF_PAGO: documento.U_NF_PAGO,
                    U_NF_PUERTOSALIDA: documento.U_NF_PUERTOSALIDA,
                    U_NF_STATUS: documento.U_NF_STATUS,
                    U_NF_TIPOCARGA: documento.U_NF_TIPOCARGA,
                    U_NT_Incoterms: documento.U_NT_Incoterms,
                    CardCode: '',
                    CardName: '',
                    ItemCode: '',
                    ItemDescription: '',
                    LineNum: 0,
                    MeasureUnit: '',
                    Quantity: 0,
                    RemainingOpenQuantity: 0,
                    approved: 'S',
                    id: documento.DocEntry,
                    key: 0,
                    WarehouseCode: ''
                };
                if (documento.DocumentLines.length > 0) {
                    for (let lineaDetalle of documento.DocumentLines) {
                        console.log(lineaDetalle);
                        lineaArray.CardCode = lineaDetalle.LineVendor;
                        lineaArray.ItemCode = lineaDetalle.ItemCode;
                        lineaArray.ItemDescription = lineaDetalle.ItemDescription;
                        lineaArray.LineNum = lineaDetalle.LineNum;
                        lineaArray.MeasureUnit = lineaDetalle.MeasureUnit;
                        lineaArray.Quantity = lineaDetalle.Quantity;
                        lineaArray.RemainingOpenQuantity = lineaDetalle.RemainingOpenQuantity;
                        lineaArray.key = documento.DocEntry + '-' + documento.DocNum + '-' + lineaDetalle.LineNum;
                        lineaArray.WarehouseCode = lineaDetalle.WarehouseCode;
                        console.log(lineaArray);
                        dataArray.push(lineaArray);
                    }
                }
                break;
            }
            return dataArray;
        });
    }
    /************** Seccion Liquitech *****************/
    loginWsLQ() {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonLog = { "username": "nitrocredit", "password": "administrador" };
            const url = `https://dev.liquitech.co/api_urls/app_usuarios/usuario/login_user/`;
            let configWs = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonLog)
            };
            //console.log(configWs);
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                const data = yield response.json();
                if (response.ok) {
                    //console.log('successfully logged  Liquitech');
                    return data;
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getTitulosLQ(token, nextPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = nextPage;
            let configWs = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            };
            //console.log(configWs);
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                if (response.ok) {
                    console.log('successfully logged  Liquitech');
                    const data = yield response.json();
                    //console.log(data);    
                    return data;
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getPagosLQ(token, nextPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${nextPage}`;
            let configWs = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            };
            //console.log(configWs);
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                const data = yield response.json();
                if (response.ok) {
                    //console.log('successfully logged  Liquitech',response,data);
                    return data;
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getTituloById(no_titulo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let infoUsuario = {
                    id: 0,
                    fullname: '',
                    email: '',
                    username: 'ABALLESTEROS',
                    codusersap: 'ABALLESTEROS',
                    status: '',
                    id_company: 0,
                    companyname: 'NITROFERT_PRD',
                    logoempresa: '',
                    bdmysql: '',
                    dbcompanysap: 'PRUEBAS_NITROFERT_PRD',
                    urlwssap: ''
                };
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL?$filter=U_FACTURA eq '${no_titulo}'`;
                    console.log(url2);
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getNitProveedorByTitulo(titulo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let infoUsuario = {
                    id: 0,
                    fullname: '',
                    email: '',
                    username: 'ABALLESTEROS',
                    codusersap: 'ABALLESTEROS',
                    status: '',
                    id_company: 0,
                    companyname: 'NITROFERT_PRD',
                    logoempresa: '',
                    bdmysql: '',
                    dbcompanysap: 'PRUEBAS_NITROFERT_PRD',
                    urlwssap: ''
                };
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(Invoices,BusinessPartners)?$expand=Invoices($select=DocEntry,DocNum),BusinessPartners($select=CardCode,FederalTaxID)&$filter=Invoices/CardCode eq BusinessPartners/CardCode and Invoices/DocNum eq ${titulo}`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    InsertTituloSL(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let infoUsuario = {
                    id: 0,
                    fullname: '',
                    email: '',
                    username: 'ABALLESTEROS',
                    codusersap: 'ABALLESTEROS',
                    status: '',
                    id_company: 0,
                    companyname: 'NITROFERT_PRD',
                    logoempresa: '',
                    bdmysql: '',
                    dbcompanysap: 'PRUEBAS_NITROFERT_PRD',
                    urlwssap: ''
                };
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL`;
                    let configWs2 = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    UpdateTituloSL(data, DocEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let infoUsuario = {
                    id: 0,
                    fullname: '',
                    email: '',
                    username: 'ABALLESTEROS',
                    codusersap: 'ABALLESTEROS',
                    status: '',
                    id_company: 0,
                    companyname: 'NITROFERT_PRD',
                    logoempresa: '',
                    bdmysql: '',
                    dbcompanysap: 'PRUEBAS_NITROFERT_PRD',
                    urlwssap: ''
                };
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL(${DocEntry})`;
                    let configWs2 = {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    //const data2 = await response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return response2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getRefPagoTitulo(titulo, refPago) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let infoUsuario = {
                    id: 0,
                    fullname: '',
                    email: '',
                    username: 'ABALLESTEROS',
                    codusersap: 'ABALLESTEROS',
                    status: '',
                    id_company: 0,
                    companyname: 'NITROFERT_PRD',
                    logoempresa: '',
                    bdmysql: '',
                    dbcompanysap: 'PRUEBAS_NITROFERT_PRD',
                    urlwssap: ''
                };
                const bieSession = yield helper.loginWsSAP(infoUsuario);
                if (bieSession != '') {
                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(CXXL,CXXL/NF_CXC_LIQUITEC_DETCollection)?$expand=CXXL($select=DocEntry,DocNum,U_FACTURA),CXXL/NF_CXC_LIQUITEC_DETCollection($select=DocEntry,U_NF_REF_PAGO)&$filter=CXXL/DocEntry eq CXXL/NF_CXC_LIQUITEC_DETCollection/DocEntry and CXXL/U_FACTURA eq '${titulo}' and CXXL/NF_CXC_LIQUITEC_DETCollection/U_NF_REF_PAGO eq '${refPago}'`;
                    let configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        }
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helper.logoutWsSAP(bieSession);
                    return data2;
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    cunsumirTitulosLQ(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //const titulos = await helper.getTitulosLQ(infoLog.data.access_token);
                let dataNewTitulo;
                let dataUpdateTitulo;
                let nextPage = `https://dev.liquitech.co/api_urls/app_operaciones/titulos_negociacion/`;
                let titulos = [];
                let titulosUpdate = [];
                let titulosPage;
                let no_titulo;
                let tituloSap;
                let resultInsertTitulo;
                let resultUpdateTitulo;
                //console.log(titulos.length,titulos.length); 
                let fechaEjecucion = new Date();
                while (nextPage != null) {
                    console.log(nextPage);
                    titulosPage = yield helper.getTitulosLQ(token, nextPage);
                    console.log(titulosPage);
                    if (titulosPage.results) {
                        for (let titulo of titulosPage.results) {
                            no_titulo = titulo.no_titulo;
                            tituloSap = yield helper.getTituloById(no_titulo);
                            //console.log(titulo);
                            if (tituloSap.value.length == 0) {
                                //Insertar factura en udo
                                let nit_pagador_sap = yield helper.getNitProveedorByTitulo(no_titulo);
                                dataNewTitulo = {
                                    U_NIT: nit_pagador_sap.value[0].BusinessPartners.FederalTaxID,
                                    U_FECHA_FACT: titulo.fecha_emision,
                                    U_TOTAL: titulo.valor_titulo,
                                    U_FACTURA: titulo.no_titulo,
                                    U_NF_ESTADO_APROBADO: titulo.estado == 'aprobado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_DESEMBOLSADO: titulo.estado == 'desembolsado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_ABONADO: titulo.estado == 'abonado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_PAGADO: titulo.estado == 'pagado' ? 'SI' : 'NO',
                                    U_NF_CUFE_FV: titulo.cufe,
                                    U_NF_FECHA_PAGO: titulo.fecha_pago,
                                    U_NF_FECHA_NEGOCIACION: titulo.fecha_negociacion,
                                    U_NF_VALOR_GIRO: titulo.valor_giro
                                };
                                resultInsertTitulo = yield helper.InsertTituloSL(dataNewTitulo);
                                titulos.push(titulo);
                            }
                            else {
                                //Update estado cabecera titulo
                                dataUpdateTitulo = {
                                    U_NF_ESTADO_APROBADO: titulo.estado == 'aprobado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_DESEMBOLSADO: titulo.estado == 'desembolsado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_ABONADO: titulo.estado == 'abonado' ? 'SI' : 'NO',
                                    U_NF_ESTADO_PAGADO: titulo.estado == 'pagado' ? 'SI' : 'NO',
                                    U_NF_CUFE_FV: titulo.cufe,
                                    U_NF_FECHA_PAGO: titulo.fecha_pago,
                                    U_NF_FECHA_NEGOCIACION: titulo.fecha_negociacion,
                                    U_NF_VALOR_GIRO: titulo.valor_giro
                                };
                                resultUpdateTitulo = yield helper.UpdateTituloSL(dataUpdateTitulo, tituloSap.value[0].DocEntry);
                                //console.log(resultUpdateTitulo);
                                titulosUpdate.push(titulo);
                            }
                        }
                        nextPage = titulosPage.next;
                    }
                    else {
                        nextPage = null;
                    }
                }
                let fechaFinalizacion = new Date();
                //Envio Notificcación registros 
                let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
                    <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>`;
                if (titulos.length > 0) {
                    html = html + `<h4>Títulos registrados</h4><br>${JSON.stringify(titulos)}<br>`;
                }
                if (titulosUpdate.length > 0) {
                    html = html + `<h4>Títulos actualizados</h4><br>${JSON.stringify(titulosUpdate)}<br>`;
                }
                if (titulos.length == titulosUpdate.length && titulosUpdate.length == 0) {
                    html = html + `<h4>No se encontraron títulos a registrar</h4><br>`;
                }
                let infoEmail = {
                    //to: LineAprovedSolped.aprobador.email,
                    to: 'ralbor@nitrofert.com.co',
                    cc: 'aballesteros@nitrofert.com.co',
                    subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
                    html
                };
                //Envio de notificación al siguiente aprobador con copia al autor
                yield helper.sendNotification(infoEmail);
                return ({ 'Titulos registrados': titulos, 'Titulos actualizados': titulosUpdate });
            }
            catch (error) {
                console.log(error);
                let infoEmail = {
                    //to: LineAprovedSolped.aprobador.email,
                    to: 'ralbor@nitrofert.com.co',
                    cc: 'aballesteros@nitrofert.com.co',
                    subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
                    html: error
                };
                //Envio de notificación al siguiente aprobador con copia al autor
                yield helper.sendNotification(infoEmail);
                return '';
            }
        });
    }
    cunsumirPagosLQ(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fechaEjecucion = new Date();
                let fechaFinPago = new Date();
                let fechaFinPagoFormat = `${fechaFinPago.getFullYear()}-${fechaFinPago.getMonth() + 1}-${fechaFinPago.getUTCDate()}`;
                let fechaInicioPago = yield helper.sumarDiasFecha(new Date(), -100);
                let fechaInicioPagoFormat = `${fechaInicioPago.getFullYear()}-${fechaInicioPago.getMonth() + 1}-${fechaInicioPago.getUTCDate()}`;
                console.log(fechaFinPagoFormat, fechaInicioPagoFormat);
                //?fecha_pago_i=2022-09-01&fecha_pago_f=2022-11-30
                let nextPage = `https://dev.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/?fecha_pago_i=${fechaInicioPagoFormat}&fecha_pago_f=${fechaFinPagoFormat}`;
                //let nextPage:any = `https://dev.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/`;
                console.log(nextPage);
                let pagos = [];
                let pagosPage;
                let refPago;
                let dataNewPago;
                let tituloSap;
                let pagosTitulo;
                let DocEntry;
                while (nextPage != null) {
                    console.log(nextPage);
                    pagosPage = yield helper.getPagosLQ(token, nextPage);
                    console.log(pagosPage);
                    if (pagosPage.results) {
                        for (let pago of pagosPage.results) {
                            //console.log(pago);
                            if (pago.valor_pagado != 0 && pago.referencia_pago != '') {
                                //Buscar titulo en SAP
                                tituloSap = yield helper.getTituloById(pago.no_titulo);
                                if (tituloSap.value.length > 0) {
                                    //console.log(tituloSap);
                                    pagosTitulo = tituloSap.value[0].NF_CXC_LIQUITEC_DETCollection;
                                    DocEntry = tituloSap.value[0].DocEntry;
                                    dataNewPago = {
                                        "U_NF_SALDO_LIQUITECH": pago.saldo_favor,
                                        "NF_CXC_LIQUITEC_DETCollection": [
                                            {
                                                "U_FECHA_PAGO": pago.fecha_pago,
                                                "U_VALOR_PAGO": pago.valor_pagado,
                                                "U_NF_REF_PAGO": pago.referencia_pago
                                            }
                                        ]
                                    };
                                    if (pagosTitulo.length == 0 || pagosTitulo.filter(item => item.U_NF_REF_PAGO == pago.referencia_pago).length == 0) {
                                        console.log(dataNewPago);
                                        //Insertar pago a titulo
                                        yield helper.UpdateTituloSL(dataNewPago, DocEntry);
                                        pagos.push(pago);
                                    }
                                }
                            }
                        }
                        nextPage = pagosPage.next === undefined ? null : pagosPage.next;
                    }
                    else {
                        nextPage = null;
                    }
                }
                let fechaFinalizacion = new Date();
                let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
            <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>
            <h4>Fecha de incio pagos:</h4> ${fechaInicioPago.toLocaleDateString().toString()}<br>
            <h4>Fecha de fin pagos:</h4> ${fechaFinPago.toLocaleDateString().toString()}<br>`;
                if (pagos.length > 0) {
                    html = html + `<h4>Pagos registrados</h4><br>${JSON.stringify(pagos)}<br>`;
                }
                else {
                    html = html + `<h4>No se encontraron pagos a registrar</h4><br>`;
                }
                let infoEmail = {
                    //to: LineAprovedSolped.aprobador.email,
                    to: 'ralbor@nitrofert.com.co',
                    cc: 'aballesteros@nitrofert.com.co',
                    subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
                    html
                };
                //Envio de notificación al siguiente aprobador con copia al autor
                yield helper.sendNotification(infoEmail);
                return (pagos);
            }
            catch (error) {
                console.log(error);
                let infoEmail = {
                    //to: LineAprovedSolped.aprobador.email,
                    to: 'ralbor@nitrofert.com.co',
                    cc: 'aballesteros@nitrofert.com.co',
                    subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
                    html: error
                };
                //Envio de notificación al siguiente aprobador con copia al autor
                yield helper.sendNotification(infoEmail);
                return '';
            }
        });
    }
}
const helper = new Helpers();
exports.default = helper;
