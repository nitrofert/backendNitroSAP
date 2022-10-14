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
                '/api/compras/solped/rechazar/'
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
            //console.log(configWs);
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                const data = yield response.json();
                if (response.ok) {
                    console.log('successfully logged SAP');
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
            id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap  
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
                trm: solpedResult[0].trm
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
                    id_user: item.id_user
                });
            }
            let solpedObject = {
                solped,
                solpedDet
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
                //to: infoEmail.to,
                to: `ralbor@nitrofert.com.co`,
                cc: `ralbor@nitrofert.com.co`,
                //cc:infoEmail.cc,
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
    loadBodyMailApprovedSolped(LineAprovedSolped, logo, solped, key, accionAprobacion) {
        return __awaiter(this, void 0, void 0, function* () {
            const solpedDet = solped.solpedDet;
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
                                        <td><a href="http://localhost:3000/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: darkblue;">Aprobar</a></td>
                                        
                                        <td><a href="http://localhost:3000/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: #ffffff;">Rechazar</a></td>
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
}
const helper = new Helpers();
exports.default = helper;
