import bcrypt from 'bcryptjs';
import jwt, { SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { InfoUsuario } from '../interfaces/decodedToken.interface';
import fetch from 'node-fetch';
import { db } from "../database";
import nitromail from "./mailer";
import { Solped, SolpedInterface } from '../interfaces/solped.interface';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";

class Helpers {

    async encryptPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    async matchPassword(password: string, savePassword: string) {
        try {
            return await bcrypt.compare(password, savePassword);
        } catch (error) {
            let now = new Date();
            console.log(error, " ", now);
        }
    }

    async generateToken(payload: any, expire: string = '12h'): Promise<string> {

        const signInOptions: SignOptions = {
            // RS256 uses a public/private key pair. The API provides the private key
            // to generate the JWT. The client gets a public key to validate the
            // signature
            //algorithm: 'RS256',
            expiresIn: expire
        };

        //Configuara secretkey con llave publica y privada generada con openssl
        //temporalmente sera secretkey

        return jwt.sign(payload, 'secreetkey', signInOptions);

    }

    async validateToken(token: string): Promise<any> {

        const verifyOptions: VerifyOptions = {
            algorithms: ['RS256'],
        };

        return await verify(token, 'secreetkey');

    }

    async validateRoute(url: string): Promise<any> {
        console.log(url);
        const routesAllowWithoutToken: string[] = [
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
    }

    async loginWsSAP(infoUsuario: InfoUsuario): Promise<any> {

        const jsonLog = { "CompanyDB": infoUsuario.dbcompanysap, "UserName": "ABALLESTEROS", "Password": "1234" };
        const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Login`;

        const configWs = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonLog)
        }

        //console.log(configWs);
        try {

            const response = await fetch(url, configWs);
            const data = await response.json();

            if (response.ok) {
                console.log('successfully logged SAP');
                return response.headers.get('set-cookie');
            } else {

                return '';

            }
        } catch (error) {
            console.log(error);
            return '';
        }



    }

    async logoutWsSAP(bieSession: string): Promise<any> {


        const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Logout`;

        const configWs = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${bieSession}`
            }
        }

        try {

            const response = await fetch(url, configWs);
            //const data = await response.json();
            if (response.ok) {
                return 'ok';
            } else {
                return '';
            }
        } catch (error) {
            console.log(error);
            return '';
        }



    }

    async format(strDate: string) {
        const inputDate: Date = new Date(strDate);
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
    }

    async getSolpedById(idSolped: string, bdmysql: string): Promise<any> {

        const solpedResult: any[] = await db.query(`
      
        SELECT T0.*, T1.*, T2.email 
        FROM ${bdmysql}.solped T0 
        INNER JOIN ${bdmysql}.solped_det T1 ON T0.id = T1.id_solped 
        INNER JOIN usuariosportal.users T2 ON T2.id = T0.id_user
        WHERE t0.id = ?`, [idSolped]);

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
        }
        let solpedDet: any[] = [];
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
        }

        return solpedObject;
    }

    async getNextLineAprovedSolped(idSolped: number, bdmysql: string, companysap: string, logo: string,idLinea?:number): Promise<any> {
        
        let condicionLinea = "";
        if(idLinea) condicionLinea = ` and t0.id!=${idLinea}`;

        const queryNextApprovedLine =`
        SELECT *
        FROM ${bdmysql}.aprobacionsolped t0
        WHERE t0.id_solped = ${idSolped} AND t0.estadoseccion = 'A' AND t0.estadoap='P' ${condicionLinea}
        ORDER BY nivel ASC`;

        console.log(queryNextApprovedLine);

        const nextLineAprovedSolped: any[] = await db.query(queryNextApprovedLine);
        console.log(nextLineAprovedSolped);
        console.log(nextLineAprovedSolped.length);
        //console.log(nextLineAprovedSolped[0].id);


        let lineAprovedSolped: any;

        if (nextLineAprovedSolped.length>0 ) {
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
                    logo
                }
            }
        } else {
            lineAprovedSolped = '';
        }




        console.log(lineAprovedSolped);
        return lineAprovedSolped;
    }

    async sendNotification(infoEmail: any): Promise<void> {

        //console.log(infoEmail);

        let mailer = nitromail.getTransporter();

        (await mailer).sendMail({
            from: `"Notificaciones NitroPortal" <${nitromail.emailsend}>`,
            //to: infoEmail.to,
            to: `ralbor@nitrofert.com.co`,
            cc: `ralbor@nitrofert.com.co`,
            //cc:infoEmail.cc,
            subject: infoEmail.subject,
            html: infoEmail.html,
            headers: { 'x-myheader': 'test header' }
        }, async function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email Send");
            }
        });

    }

    async testSendMail(): Promise<void> {
        const transporter = await nitromail.getTransporter();
        transporter.sendMail({
            from: `"Notificaciones NitroPortal" <${nitromail.emailsend}>`,
            to: "ralbor@nitrofert.com.co",
            subject: "Hello from nitrosap",
            text: "Hello nitrosap?",
            html: "<strong>Hello nitrosap?</strong>",
            headers: { 'x-myheader': 'test header' }
        });
    }

    async DetalleAprobacionSolped(idSolped: number, bdmysql: string): Promise<any> {
        const detalleAprobacionSolped: any[] = await db.query(`
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
    }

    async loadBodyMailSolpedAp(LineAprovedSolped: any, logo: string, solped: any, key: string, accionAprobacion?:boolean): Promise<string> {

        const solpedDet: any[] = solped.solpedDet;
        let subtotal = 0;
        let totalimpuesto = 0;
        let total = 0;
        const detalleAprobacionSolped = await helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
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

            if(accionAprobacion){

            
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


        let bottonsAproved ="";
        if(key!==''){
            bottonsAproved = `<table>
                                    <tr>
                                        <td><a href="http://localhost:3000/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">Aprobar</a></td>
                                        
                                        <td><a href="http://localhost:3000/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a></td>
                                    </tr>
                                </table>`;
        }

        const html: string = `<!DOCTYPE html>
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
    }

    async loadBodyMailApprovedSolped(LineAprovedSolped: any, logo: string, solped: any, key: string, accionAprobacion?:boolean): Promise<string> {

        const solpedDet: any[] = solped.solpedDet;
        let subtotal = 0;
        let totalimpuesto = 0;
        let total = 0;
        const detalleAprobacionSolped = await helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
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

            if(accionAprobacion){
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


        let bottonsAproved ="";
        if(key!==''){
            bottonsAproved = `<table>
                                    <tr>
                                        <td><a href="http://localhost:3000/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: darkblue;">Aprobar</a></td>
                                        
                                        <td><a href="http://localhost:3000/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 5px; color: #ffffff;">Rechazar</a></td>
                                    </tr>
                                </table>`;
        }

        const html: string = `<!DOCTYPE html>
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
    }

    async loadBodyMailRejectSolped(LineAprovedSolped: any, logo: string, solped: any): Promise<string> {

        const solpedDet: any[] = solped.solpedDet;
        let subtotal = 0;
        let totalimpuesto = 0;
        let total = 0;
        const detalleAprobacionSolped = await helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
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

        const html: string = `<!DOCTYPE html>
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
    }

    async loadInfoSolpedToJSONSAP(Solped:any): Promise<PurchaseRequestsInterface>{
        let dataSolopedJSONSAP:PurchaseRequestsInterface;
        let DocumentLines:DocumentLine[] =[];
        let DocumentLine:DocumentLine;

        for(let item of Solped.solpedDet){
            DocumentLine={
                LineNum:item.linenum,
                //Currency:item.trm===1?'$':item.moneda,
                Currency:item.moneda==='COP'?'$':item.moneda,
                //Rate: item.trm,
                ItemDescription:item.dscription,
                RequiredDate:item.reqdatedet,
                
               
                //LineTotal:item.linetotal,
                //GrossTotal:item.linegtotal,
                
                TaxCode:item.tax,
                CostingCode:item.ocrcode,
                CostingCode2:item.ocrcode2,
                CostingCode3:item.ocrcode3,
                WarehouseCode:item.whscode!==''?item.whscode:'SM_N300'
                
                
                
            };

            if(item.itemcode!==''){
                DocumentLine.ItemCode = item.itemcode;
            }
            if(item.linevendor!==''){
                DocumentLine.LineVendor = item.linevendor;
            }
            if(item.acctcode!==''){
                DocumentLine.AccountCode = item.acctcode;
            }
            if(item.whscode===''){
                if(Solped.solped.serie==='SPB'){
                    DocumentLine.WarehouseCode = 'SM_N300';
                }
            }else{
                DocumentLine.WarehouseCode = item.whscode;
            }

            if(Solped.solped.doctype=='S'){
               
                DocumentLine.LineTotal=item.linetotal;
            }else{
                DocumentLine.Price=item.price,
                DocumentLine.Quantity=item.quantity;
            }

            DocumentLine.TaxLiable='tYES';

            DocumentLine.U_ID_PORTAL=item.id_solped;
            DocumentLine.U_NF_NOM_AUT_PORTAL=Solped.solped.usersap;

            DocumentLines.push(DocumentLine);
        }

            dataSolopedJSONSAP = {
                Requester:Solped.solped.usersap,
                RequesterName:Solped.solped.fullname,
                U_NF_DEPEN_SOLPED:Solped.solped.u_nf_depen_solped,
                DocType:Solped.solped.doctype,
                Series:Solped.solped.serie,
                DocDate: Solped.solped.docdate,
                DocDueDate:Solped.solped.docduedate,
                TaxDate:Solped.solped.taxdate,
                RequriedDate:Solped.solped.reqdate,
                
                //DocRate: Solped.solped.trm,
                Comments:Solped.solped.comments,
                U_AUTOR_PORTAL:Solped.solped.usersap,
                //JournalMemo:Solped.solped.comments,
                DocumentLines
    
            };

        console.log(JSON.stringify(dataSolopedJSONSAP));

        return dataSolopedJSONSAP;
    }


    async registerSolpedSAP(infoUsuario: InfoUsuario, data: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

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

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                //console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            console.log(error);
            return '';
        }



    }

    async updateSolpedSAP(infoUsuario: InfoUsuario, data: any, docEntry:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${docEntry})`;

                let configWs2 = {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    },
                    body: JSON.stringify(data)

                }

                const response2 = await fetch(url2, configWs2);
                //const data2 = await response2.json();

                

                console.log(response2);
                helper.logoutWsSAP(bieSession);

                return response2;

            }

        } catch (error) {
            console.log(error);
            return '';
        }



    }


    async registerProcApSolpedSAP(infoUsuario: InfoUsuario, bdmysql:string,idSolped:any,docNumSAP:any): Promise<any> {


        try {

            let queryListAprobacionesSolped =`
                SELECT t0.id AS "key",t1.sapdocnum,t1.id, t0.updated_at,t0.nombreaprobador,t0.estadoap,t0.comments
                FROM ${bdmysql}.aprobacionsolped t0 
                INNER JOIN ${bdmysql}.solped t1 ON t1.id = t0.id_solped 
                WHERE t0.id_solped =${idSolped} and t0.estadoseccion='A'`;

            let resultListAprobacionesSolped = await db.query(queryListAprobacionesSolped);

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/U_NF_APRO_SOLPED_WEB`;

                let arrayResult = [];
                let data ;
                                
                for(let item of resultListAprobacionesSolped){
                    data = { "Code":item.key, 
                    "Name":item.key,
                    "U_NF_FECHA_APRO":item.updated_at,
                    "U_NF_NOM_APROB":item.nombreaprobador,
                    "U_NF_ESTADO_APRO":"A", 
                    "U_NF_COM_AROB":item.comments, 
                    "U_NF_NUM_SOLPED_WEB":item.id, 
                    "U_NF_NUM_SOLPED_SAP":docNumSAP};

                    let configWs2 = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
    
                    }
    
                    let response2 = await fetch(url2, configWs2);
                    let data2 = await response2.json();
                    arrayResult.push(data2);
                    console.log(data2);

                    
                }

                

                helper.logoutWsSAP(bieSession);

                return arrayResult;

            }

        } catch (error) {
            console.log(error);
            return '';
        }



    }

    async getEntradaById(idEntrada: string, bdmysql: string): Promise<any> {

        const entradaResult: any[] = await db.query(`
      
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
            CardCode:entradaResult[0].codigoproveedor,
            CardName:entradaResult[0].nombreproveedor,
            DocNum:entradaResult[0].pedidonumsap,
            Comments: entradaResult[0].comments,
            trm: entradaResult[0].trm,
            currency:entradaResult[0].currency

        }
        let entradaDet: any[] = [];
        let DocumentLines:any[] = [];
        for (let item of entradaResult) {

            entradaDet.push({
                id_entrada: item.id_entrada,
                LineNum: item.linenum,
                LineStatus: item.linestatus==='O'?'bost_Open':'bost_Close',
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
                RemainingOpenQuantity:item.cantidad_pendiente,
                BaseDocNum:item.basedocnum,
                BaseEntry:item.baseentry,
                BaseLine:item.baseline,
                BaseType:item.basetype
            });

            DocumentLines.push({
                id_entrada: item.id_entrada,
                LineNum: item.linenum,
                LineStatus: item.linestatus==='O'?'bost_Open':'bost_Close',
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
                RemainingOpenQuantity:item.cantidad_pendiente,
                BaseDocNum:item.basedocnum,
                BaseEntry:item.baseentry,
                BaseLine:item.baseline,
                BaseType:item.basetype
            });
        }


        let entradaObject = {
            entrada,
            entradaDet
        }

        let infoEntrada ={
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
            CardCode:entradaResult[0].codigoproveedor,
            CardName:entradaResult[0].nombreproveedor,
            DocNum:entradaResult[0].pedidonumsap,
            Comments: entradaResult[0].comments,
            trm: entradaResult[0].trm,
            currency:entradaResult[0].currency,
            DocumentLines
        }

        console.log(entradaObject,infoEntrada);

        return infoEntrada;
    }

    async loadInfoEntradaToJSONSAP(Entrada:any): Promise<any>{
        let dataEntradaJSONSAP:any;
        let DocumentLines:any[] =[];
        let DocumentLine:any;

        for(let item of Entrada.EntradaDet){
            DocumentLine={
                //LineNum:item.linenum,
                //Currency:item.trm===1?'$':item.moneda,
                //Currency:item.moneda==='COP'?'$':item.moneda,
                //Rate: item.trm,
                ItemDescription:item.dscription,
                //RequiredDate:item.reqdatedet,
                Quantity:item.cantidad,
                Price:item.precio,
                //LineTotal:item.linetotal,
                //GrossTotal:item.linegtotal,
                TaxCode:item.tax,
                CostingCode:item.ocrcode,
                CostingCode2:item.ocrcode2,
                CostingCode3:item.ocrcode3,
                WarehouseCode:item.whscode!==''?item.whscode:'SM_N300',
                BaseType:item.BaseType,
                BaseEntry:item.BaseEntry,
                BaseLine:item.BaseLine

                
            };

            if(item.itemcode!==''){
                DocumentLine.ItemCode = item.itemcode;
            }
            
            if(item.acctcode!==''){
                DocumentLine.AccountCode = item.acctcode;
            }
            if(item.whscode===''){
                
                    DocumentLine.WarehouseCode = 'SM_N300';
                
            }else{
                DocumentLine.WarehouseCode = item.whscode;
            }

            DocumentLines.push(DocumentLine);
        }

            dataEntradaJSONSAP = {
               
                DocType:Entrada.entrada.doctype,
                Series:Entrada.entrada.serie,
                DocDate: Entrada.entrada.docdate,
                DocDueDate:Entrada.entrada.docduedate,
                TaxDate:Entrada.entrada.taxdate,
                //RequriedDate:Entrada.entrada.reqdate,
                CardCode:Entrada.entrada.codigoproveedor,
                CardName:Entrada.entrada.nombreproveedor,
                Comments:Entrada.entrada.comments,
                U_AUTOR_PORTAL:Entrada.entrada.usersap,
                DocumentLines
    
            };

        console.log(JSON.stringify(dataEntradaJSONSAP));

        return dataEntradaJSONSAP;
    }

    async registerEntradaSAP(infoUsuario: InfoUsuario, data: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseDeliveryNotes`;

                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    },
                    body: JSON.stringify(data)

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                //console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            console.log(error);
            return '';
        }



    }



}
const helper = new Helpers();
export default helper;