import bcrypt from 'bcryptjs';
import jwt, { SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { InfoUsuario } from '../interfaces/decodedToken.interface';
import fetch from 'node-fetch';
import { db } from "../database";
import nitromail from "./mailer";
import { Solped, SolpedInterface } from '../interfaces/solped.interface';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";


class Helpers {

     public mesesAnio = [{mes:1, mesStr:'Enero'},
            {mes:2, mesStr:'Febrero'},
            {mes:3, mesStr:'Marzo'},
            {mes:4, mesStr:'Abril'},
            {mes:5, mesStr:'Mayo'},
            {mes:6, mesStr:'Junio'},
            {mes:7, mesStr:'Julio'},
            {mes:8, mesStr:'Agosto'},
            {mes:9, mesStr:'Septiembre'},
            {mes:10, mesStr:'Octubre'},
            {mes:11, mesStr:'Noviembre'},
            {mes:12, mesStr:'Diciembre'}];

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
            //////////console.log(error, " ", now);
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
        try{

            const verifyOptions: VerifyOptions = {
                algorithms: ['RS256'],
            };

            return await verify(token, 'secreetkey');

         }catch (error: any) {
            console.error(error);
           
        }
        

        

    }

    async validateRoute(url: string): Promise<any> {
        //////////console.log(url);
        const routesAllowWithoutToken: string[] = [
            '/api/auth/login',
            '/api/auth/recaptcha',
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
            '/api/nitroLQ/titulos/pagos',
            '/uploads/solped/',
            '/api/config/'

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

        const jsonLog = { "CompanyDB": infoUsuario.dbcompanysap, 
                          "UserName": "USERAPLICACIONES", 
                          "Password": "Nitro123",
                          "Language": "25" };
        ////console.log(jsonLog);
        const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Login`;
        const configWs = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonLog)
        }

        //////console.log(configWs);

        try {

            const response = await fetch(url, configWs);

            const data = await response.json();

            //////console.log(response);

            if (response.ok) {
                //////////console.log('successfully logged SAP');
                return response.headers.get('set-cookie');
            } else {
                console.error('error logged SAP');
                return '';

            }
        } catch (error) {
            console.error(error);
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
            //////////console.log(error);
            return '';
        }



    }

    async logaccion(infoUsuario:InfoUsuario, detalleaccion:string): Promise<any> {
       try{

            let databasportal:string =infoUsuario.bdmysql;
            let databasesap:string =infoUsuario.dbcompanysap;
            let idUsuario:number = infoUsuario.id;
    
            let insertLog= `Insert INTO logs (fechalog,databasportal,databasesap,id_usuario,detalleaccion) values(NOW(),'${databasportal}','${databasesap}',${idUsuario},'${detalleaccion}')`;
            let result = await db.query(insertLog);
 
            return result;

       }catch(error){
        console.error(error);
        return error;
       }
       
    }

    async getInfoUsuario(userid: number, company:string): Promise<any> {
        try{
        const query = `
        SELECT 	
                t0.id, 
                t0.fullname, 
                t0.email, 
                t0.username, 
                t0.codusersap, 
                t0.status, 
                t1.id_company,
                t2.companyname, 
                t2.logoempresa, 
                t2.urlwsmysql AS bdmysql, 
                t2.dbcompanysap, 
                t2.urlwssap ,
                t2.nit,
                t2.direccion,
                t2.telefono 
        FROM    users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE   t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`;
        //////console.log(query,userid,company);
        const infoUsuario = await db.query(query,[userid,company]);
        
        return infoUsuario;
    }catch(error){
        console.error(error);
        return error;
       }
    }

    async getLogo64(userid: number, company:string): Promise<any> {
        
        const infoUsuario = await db.query(`
        SELECT t2.logobase64
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ? AND t2.id = ? AND t0.status ='A' AND t2.status ='A'`,[userid,company]);

        ////////////console.log(infoUsuario);

        return infoUsuario;
    }

    async getEmpresasUsuario(userid: number): Promise<any> {
        
        const empresasUsuario = await db.query(`
        SELECT t0.id, id_company,companyname, logoempresa, urlwsmysql AS bdmysql, dbcompanysap, urlwssap  ,nit, direccion, telefono
        FROM users t0 
        INNER JOIN company_users t1 ON t1.id_user = t0.id
        INNER JOIN companies t2 ON t2.id = t1.id_company
        WHERE t0.id = ?  AND t0.status ='A' AND t2.status ='A'`,[userid]);

        return empresasUsuario;
    }

    async getPermisoUsuario(userid: number): Promise<any> {
        
        const permisosUsuario = await db.query(`SELECT t0.*,  t2.url
                                                        FROM perfil_menu_accions t0 
                                                        INNER JOIN  perfiles t1 ON t1.id = t0.id_perfil
                                                        INNER JOIN menu t2 ON t2.id = t0.id_menu
                                                        WHERE t0.id_perfil IN (SELECT tt0.id_perfil FROM perfil_users tt0 WHERE tt0.id_user = ?)`,[userid]);

        return permisosUsuario;
    }

    async getPerfilesUsuario(userid: number): Promise<any> {
        
        const perfilesUsuario = await db.query(`SELECT t0.id, t0.perfil 
                                                FROM perfiles t0 
                                                INNER JOIN perfil_users t1 ON t1.id_perfil = t0.id 
                                                WHERE t1.id_user = ?`,[userid]);

        return perfilesUsuario;
    }

    async getMenuUsuario(userid: number): Promise<any> {
        
        const opcionesMenu = await db.query(`SELECT DISTINCT t0.* 
        FROM menu t0 
        INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
        WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
            t0.hierarchy ='P' AND
            t1.read_accion = true
        ORDER BY CAST((REPLACE(t0.ordernum, '.', '')) AS SIGNED) ASC;`,[userid]);

const opcionesSubMenu = await db.query(`SELECT DISTINCT t0.* 
            FROM menu t0 
            INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
            WHERE t1.id_perfil IN (SELECT t10.id FROM perfiles t10 INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id WHERE t11.id_user = ?) AND
                t0.hierarchy ='H' AND
                t1.read_accion = true 
            ORDER BY CAST((REPLACE(t0.ordernum, '.', '')) AS SIGNED) ASC;`,[userid]);


            let menuUsuario =  {
                                    opcionesMenu,
                                    opcionesSubMenu
                               }
                                

        return  menuUsuario;
    }

    async formatDate(date:Date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
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
        INNER JOIN users T2 ON T2.id = T0.id_user
        WHERE T0.id = ?`, [idSolped]);

        ////////////console.log((solpedResult));

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
            u_nf_status:solpedResult[0].u_nf_status,
            nf_lastshippping:solpedResult[0].nf_lastshippping,
            nf_dateofshipping:solpedResult[0].nf_dateofshipping,
            nf_agente:solpedResult[0].nf_agente,
            nf_pago:solpedResult[0].nf_pago,
            nf_tipocarga:solpedResult[0].nf_tipocarga,
            nf_puertosalida:solpedResult[0].nf_puertosalida,
            nf_motonave:solpedResult[0].nf_motonave,
            nf_pedmp:solpedResult[0].nf_pedmp,
            nf_Incoterms:solpedResult[0].nf_Incoterms,
            docentrySP:solpedResult[0].docentrySP

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
                id_user: item.id_user,
                unidad:item.unidad,
                zonacode:item.zonacode,
                proyecto:item.proyecto,
                subproyecto:item.subproyecto,
                etapa:item.etapa,
                actividad:item.actividad
            });

        }

        const anexosSolpedResult: any[] = await db.query(`SELECT * FROM ${bdmysql}.anexos t0 WHERE t0.id_solped =  ?`, [idSolped]);

        let solpedObject = {
            solped,
            solpedDet,
            anexos:anexosSolpedResult
        }

        return solpedObject;
    }

    async ProyectosSolped(idSolped: string, bdmysql: string): Promise<any> {

        const query = `SELECT t0.docdate, t1.linenum, t1.proyecto, t1.subproyecto, t1.etapa, t1.actividad, t1.linetotal
        FROM ${bdmysql}.solped t0 
        INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
        WHERE t1.proyecto!='' AND t1.subproyecto!='' AND t1.etapa !='' AND t1.actividad!='' AND t0.id = ${idSolped}`;

        const proyectosSolped: any[] = await db.query(query);
        return proyectosSolped;
    }

    

    async getNextLineAprovedSolped(idSolped: number, 
                                   bdmysql: string, 
                                   companysap: string, 
                                   logo: string,
                                   origin:string='http://localhost:4200',
                                   urlbk:string,
                                   idLinea?:number): Promise<any> {
        
        let lineAprovedSolped: any="";
        let condicionLinea = "";
        if(idLinea) condicionLinea = ` and t0.id!=${idLinea}`;

        const queryNextApprovedLine =`
        SELECT *
        FROM ${bdmysql}.aprobacionsolped t0
        WHERE t0.id_solped = ${idSolped} AND t0.estadoseccion = 'A' AND t0.estadoap='P' ${condicionLinea}
        ORDER BY nivel ASC`;

        const nextLineAprovedSolped: any[] = await db.query(queryNextApprovedLine);

        if (nextLineAprovedSolped.length>0 ) {

            const queryCompania =`SELECT * FROM companies t0 WHERE t0.urlwsmysql = '${bdmysql}'`;
            const compania:any[] = await db.query(queryCompania);

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
                    origin,
                    documento:'solped',
                    idCompania:compania[0].id,
                    urlbk
                }
            }
        }
        return lineAprovedSolped;
    }

    async sendNotification(infoEmail: any): Promise<void> {

        ////////////console.log(infoEmail);

        let mailer = nitromail.getTransporter();

        (await mailer).sendMail({
            from: `"Notificaciones NitroPortal" <${nitromail.emailsend}>`,
            to: infoEmail.to,
            //to: `ralbor@nitrofert.com.co`,
            //cc: `ralbor@nitrofert.com.co`,
            cc:infoEmail.cc,
            subject: infoEmail.subject,
            html: infoEmail.html,
            headers: { 'x-myheader': 'test header' }
        }, async function (error, info) {
            if (error) {
                //////////console.log(error);
            } else {
                //////////console.log("Email Send");
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

        //////////console.log((detalleAprobacionSolped));

        return detalleAprobacionSolped;
    }

    async loadBodyMailSolpedAp(infoUsuario:any, LineAprovedSolped: any, logo: string, solped: any, key: string, urlbk:string,accionAprobacion?:boolean,verBotones?:boolean): Promise<string> {

        const solpedDet: any[] = solped.solpedDet;
        const anexosSolped:any[] = solped.anexos
        let subtotal = 0;
        let totalimpuesto = 0;
        let total = 0;
        const detalleAprobacionSolped = await helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
        let htmlDetalleAprobacion = '';
        let lineaDetalleAprobacion = '';
        let serieNombre = "";
        let seriesDoc = await helper.getSeriesXE(infoUsuario.dbcompanysap,'1470000113');
        for(let item in seriesDoc) {
            if(seriesDoc[item].code == solped.solped.serie){
                serieNombre = seriesDoc[item].name;
            }
        }
        //////////console.log(infoUsuario,seriesDoc);
        

        
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
                                                            <span style="font-size:smaller;padding-left: 3px;">${item.moneda} ${item.price.toLocaleString()}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.trm.toLocaleString()}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linetotal.toLocaleString()}</span>
                                                        </td> 
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.taxvalor.toLocaleString()}</span>
                                                        </td>
                                                        <td>
                                                            <span style="font-size:smaller;padding-left: 3px;">$ ${item.linegtotal.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
            `;
        }

        let anexos = ``;

        for(let anexo of anexosSolped){
            anexos = anexos+ `<tr>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.tipo}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.nombre}</span>
                                </td>
                                <td>
                                    <!--<span style="font-size:smaller;padding-left: 3px;"><a href="${urlbk}/${anexo.ruta}" target="blank">Descargar anexo</a></span>-->
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


        let bottonsAproved ="";
        if(key!=='' && verBotones){
            bottonsAproved = `<table>
                                    <tr>
                                        <!--<td><a href="${urlbk}/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">Aprobar</a></td>-->
                                        <td><b>Para aprobar o rechazar esta solicitud haga clic <a href="https://aprobaciones.nitrofert.com.co/#/login/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">AQUI</a></b></td>
                                        
                                        <!--<td><a href="${urlbk}/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a></td>-->
                                        <!--<td><a href="http://localhost:4200/#/login/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a>-->
                                    </tr>
                                </table>`;
        }

        let saludo  = "";
        

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
                                                    <h1>Solicitud De Aprobación Solped # ${solped.solped.id}</h1>
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
                                                                <span style="font-size:smaller;padding-left: 3px;">${serieNombre}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha contabilización / Fecha expira </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${await helper.format(solped.solped.docdate)} - ${ await helper.format(solped.solped.docduedate)}</span><br />
                                                                <span style="font-weight: bold; font-size: smaller; padding-left: 2px;">Fecha ducumento / Fecha necesaria </span><br />
                                                                <span style="font-size:smaller;padding-left: 3px;">${await helper.format(solped.solped.taxdate)} - ${await helper.format(solped.solped.reqdate)}</span><br />
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
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${subtotal.toFixed()}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total impuestos</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${totalimpuesto.toLocaleString()}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style="font-weight: bold; font-size: samll; padding-left: 2px;">Total solped</span></td>
                                                                <td><span style="font-size:smaller;padding-left: 3px;">$ ${total.toLocaleString()}</span></td>
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
                                                    
                                                    ${bottonsAproved}
                                                </td>
                                                <td style="padding:0;width:50%;" align="right">
                                                <p>&reg; Nitro Portal, TI 2022<br/><a href="http://localhost:4200/">Nitroportal</a></p>

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

    async loadBodyMailApprovedSolped(infoUsuario:any,
                                     LineAprovedSolped: any, 
                                     logo: string, 
                                     solped: any, 
                                     key: string, 
                                     urlbk:string,
                                     accionAprobacion?:boolean): Promise<string> {

        const solpedDet: any[] = solped.solpedDet;
        const anexosSolped:any[] = solped.anexos
        let subtotal = 0;
        let totalimpuesto = 0;
        let total = 0;
        const detalleAprobacionSolped = await helper.DetalleAprobacionSolped(solped.solped.id, LineAprovedSolped.infoSolped.bdmysql);
        let htmlDetalleAprobacion = '';
        let lineaDetalleAprobacion = '';
        let serieNombre =  "";
        let seriesDoc = await helper.getSeriesXE(infoUsuario.dbcompanysap,'1470000113');
        for(let item in seriesDoc) {
            if(seriesDoc[item].code == solped.solped.serie){
                serieNombre = seriesDoc[item].name;
            }
        }
        //////////console.log(infoUsuario,seriesDoc);
        
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

        let anexos = ``;

        for(let anexo of anexosSolped){
            anexos = anexos+ `<tr>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.tipo}</span>
                                </td>
                                <td>
                                    <span style="font-size:smaller;padding-left: 3px;">${anexo.nombre}</span>
                                </td>
                                <td>
                                    <!--<span style="font-size:smaller;padding-left: 3px;"><a href="${urlbk}/${anexo.ruta}" target="blank">Descargar anexo</a></span>-->
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


        let bottonsAproved ="";
        if(key!==''){
           bottonsAproved = `<table>
                                    <tr>
                                        <!--<td><a href="${urlbk}/api/compras/solped/aprobar/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">Aprobar</a></td>-->
                                        <td><b>Para aprobar o rechazar esta solicitud haga clic <a href="https://aprobaciones.nitrofert.com.co/#/login/${key}" style="padding: 10px; background:darkseagreen; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: darkblue;">AQUÍ</a></b></td>
                                        
                                        <!--<td><a href="${urlbk}/api/compras/solped/rechazar/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a></td>-->
                                        <!--<td><a href="http://localhost:4200/#/login/${key}" style="padding: 10px; background:lightcoral; border-collapse:collapse;border:0;border-spacing:0; margin-right: 50px; color: #ffffff;">Rechazar</a>-->
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
                                                                <span style="font-size:smaller;padding-left: 3px;">${serieNombre}</span><br />
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
            //console.log(item);
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

            if(item.proyecto!=""){
                DocumentLine.ProjectCode = item.proyecto;
            }

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

            if(Solped.solped.u_nf_status!=null){
                dataSolopedJSONSAP.U_NF_STATUS = Solped.solped.u_nf_status=='Proyectado'?'Solicitado':Solped.solped.u_nf_status;
            }
            if(Solped.solped.nf_lastshippping!=null){
                dataSolopedJSONSAP.U_NF_LASTSHIPPPING = Solped.solped.nf_lastshippping;
            }
            if(Solped.solped.nf_dateofshipping!=null){
                dataSolopedJSONSAP.U_NF_DATEOFSHIPPING = Solped.solped.nf_dateofshipping;
            }
            if(Solped.solped.nf_agente!=null){
                dataSolopedJSONSAP.U_NF_AGENTE = Solped.solped.nf_agente;
            }
            if(Solped.solped.nf_pago!=null){
                dataSolopedJSONSAP.U_NF_PAGO = Solped.solped.nf_pago;
            }
            if(Solped.solped.nf_tipocarga!=null){
                dataSolopedJSONSAP.U_NF_TIPOCARGA = Solped.solped.nf_tipocarga;
            }
            if(Solped.solped.nf_puertosalida!=null){
                dataSolopedJSONSAP.U_NF_PUERTOSALIDA = Solped.solped.nf_puertosalida;
            }
            if(Solped.solped.nf_motonave!=null){
                dataSolopedJSONSAP.U_NF_MOTONAVE = Solped.solped.nf_motonave;
            }

            if(Solped.solped.nf_pedmp!=null){
                dataSolopedJSONSAP.U_NF_PEDMP = Solped.solped.nf_pedmp;
                
            }

            if(Solped.solped.nf_Incoterms!=null){
                dataSolopedJSONSAP.U_NT_Incoterms = Solped.solped.nf_Incoterms;
            }

        ////console.log(JSON.stringify(dataSolopedJSONSAP));

        return dataSolopedJSONSAP;
    }


    async registerSolpedSAP(infoUsuario: InfoUsuario, data: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            //console.log(JSON.stringify(data));

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests`;
                ////////console.log(url2,JSON.stringify(data));
                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    },
                    body: JSON.stringify(data)

                }
                //////console.log(configWs2);

                const response2 = await fetch(url2, configWs2);
                
                const data2 = await response2.json();
                ////////console.log('registerSolpedSAP',data2);
                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async registrarProyectosSolped(infoUsuario: InfoUsuario, DocEntry:any, detalle_proyectos:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            //////////console.log(JSON.stringify(data));

            if (bieSession != '') {
                let data:any;
                let response2:any
                let data2:any;
                let configWs2:any;
                for(let proyecto of detalle_proyectos){

                    data = {
                        "PM_DocumentsCollection":[
                            {
                                "StageID": proyecto.etapa,
                                "DocType": "pmdt_PurchaseRequest",
                                "DocEntry": DocEntry,
                                "DocDate": proyecto.docdate,
                                "Total": proyecto.linetotal,
                                "LineNumber": proyecto.linenum,
                                "Status": "lst_Open",
                                "AmountCategory": "act_Open",
                                "Categorize": null,
                                "Operation": null,
                                "U_NF_DOC": null
                            }
                        ]
                    }

                    const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/ProjectManagements(${proyecto.subproyecto})`;
                    ////////console.log(url2,JSON.stringify(data));

                    configWs2 = {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data)
                    }
                
                    response2 = await fetch(url2, configWs2);
                    console.log(data,response2)
                    //data2 = await response2.json();

                }

                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            console.error(error);
            return '';
        }



    }

    async CancelSolpedSAP(infoUsuario: InfoUsuario,  docEntry:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${docEntry})/Cancel`;

                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    },
                }

                const response2 = await fetch(url2, configWs2);

                helper.logoutWsSAP(bieSession);

                if(response2.status!=204){
                    const data2 = await response2.json();
                    return data2;  
                }

                return response2;

            }

        } catch (error) {
            //////////console.log(error);
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

                

                //////////console.log(response2);
                helper.logoutWsSAP(bieSession);

                return response2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }


    async registerProcApSolpedSAP(infoUsuario: InfoUsuario, bdmysql:string,idSolped:any,docNumSAP:any): Promise<any> {
        
        try {
            const Solped:any = await helper.getSolpedById(idSolped,infoUsuario.bdmysql);
            let queryListAprobacionesSolpedMysql =`
                SELECT t0.id AS "key",t1.sapdocnum,t1.id, t0.updated_at,t0.nombreaprobador,t0.estadoap,t0.comments
                FROM ${bdmysql}.aprobacionsolped t0 
                INNER JOIN ${bdmysql}.solped t1 ON t1.id = t0.id_solped 
                WHERE t0.id_solped =${idSolped} and t0.estadoseccion='A'`;

            let resultListAprobacionesSolpedMysql:any[] = await db.query(queryListAprobacionesSolpedMysql);
            //////console.log('resultListAprobacionesSolpedMysql', resultListAprobacionesSolpedMysql);

            const bieSession = await helper.loginWsSAP(infoUsuario);
            let arrayError: any[] = [];

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/U_NF_APRO_SOLPED_WEB`;

                
                //let data ;

                //Buscar id solped del portal en tabla de aprobaciones de SAP
                let configWs2:any = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }
                }

                const consultaAprobacionesSolpedSAP = await fetch(`${url2}?$filter=U_NF_NUM_SOLPED_WEB eq '${idSolped}'`,configWs2);
                const aprobacionesSolpedSAP = await consultaAprobacionesSolpedSAP.json();
                //////console.log('aprobacionesSolpedSAP LENGTH',aprobacionesSolpedSAP.value.length);
                if(aprobacionesSolpedSAP.value.length > 0){
                    //Existe proceso de aprobación para la solped
                    //Obtener SapDocNum del proceso de aprobacion y cancelar solped
                    let oldSapDocNum = aprobacionesSolpedSAP.value[0].U_NF_NUM_SOLPED_SAP;
                    let oldDocEntry:any = await helper.getSolpedByIdSL(infoUsuario,oldSapDocNum,Solped.solped.serie);
                    //////console.log('oldDocEntry',oldDocEntry.value[0].DocEntry);
                    const cancelOldSolpedSap = await helper.CancelSolpedSAP(infoUsuario,oldDocEntry.value[0].DocEntry);
                    if(cancelOldSolpedSap.error){
                        arrayError.push({
                            message:`Error en cancelación de solpe antigua ${oldSapDocNum}: ${cancelOldSolpedSap.error.message.value}`
                        });
                    }
                    //Recorrer array del proceso de aprobacion de SAP y actualizar fecha y codigo  de solped nueva en linea del processo de aprobacion SAP
                   
                    configWs2.method = 'PATCH';

                    for(let lineaPA of aprobacionesSolpedSAP.value){
                        let data:any = {
                            "U_NF_NUM_SOLPED_SAP":docNumSAP
                        }
                        if(resultListAprobacionesSolpedMysql.find(lineaPAMysql => lineaPAMysql.key == lineaPA.Code && lineaPAMysql.estadoap=='A')){
                            data.U_NF_FECHA_APRO = new Date(resultListAprobacionesSolpedMysql.find(lineaPAMysql => lineaPAMysql.key == lineaPA.Code && lineaPAMysql.estadoap=='A').updated_at)
                        }else{
                            data.U_NF_FECHA_APRO = new Date();
                            data.U_NF_ESTADO_APRO = 'A';
                        }

                        configWs2.body =  JSON.stringify(data);
                        ////console.log('PATCH',`${url2}('${lineaPA.Code}')`, data);
                        const updateLineaApSAP = await fetch(`${url2}('${lineaPA.Code}')`,configWs2);
                        if(updateLineaApSAP.status!=204){
                            let errorUpdateLineaApSAP = await updateLineaApSAP.json();
                            arrayError.push({
                                message:`Error en actualización de la linea ${lineaPA.Code} del proceso de aprbación SAP : ${errorUpdateLineaApSAP.error.message.value}`
                            });
                        }

                    }

                }else{
                    //No existe proceso de aprobación para la solped
                    //recorrer array del proceso de aprobacion de mysql e insrtar lineas en SAP

                    configWs2.method = 'POST';
                    for(let item of resultListAprobacionesSolpedMysql){

                        let data = {    
                                    "Code":item.key, 
                                    "Name":item.key,
                                    "U_NF_FECHA_APRO":new Date(),
                                    "U_NF_NOM_APROB":item.nombreaprobador,
                                    "U_NF_ESTADO_APRO":"A", 
                                    "U_NF_COM_AROB":item.comments, 
                                    "U_NF_NUM_SOLPED_WEB":item.id, 
                                    "U_NF_NUM_SOLPED_SAP":docNumSAP
                                };

                        configWs2.body =  JSON.stringify(data);
                        const registrarLineaPASAP = await  fetch(`${url2}`,configWs2);
                        if(registrarLineaPASAP.status != 201){
                            let errorregistrarLineaPASAP = await registrarLineaPASAP.json();
                            arrayError.push({
                                message:`Error en registro de la linea ${item.key} del proceso de aprbación SAP : ${errorregistrarLineaPASAP.error.message.value}`
                            });
                        }
                    }
                }

                /*                
                for(let item of resultListAprobacionesSolpedMysql){
                    
                    
                    data = { "Code":item.key, 
                    "Name":item.key,
                    "U_NF_FECHA_APRO":new Date(),
                    "U_NF_NOM_APROB":item.nombreaprobador,
                    "U_NF_ESTADO_APRO":"A", 
                    "U_NF_COM_AROB":item.comments, 
                    "U_NF_NUM_SOLPED_WEB":item.id, 
                    "U_NF_NUM_SOLPED_SAP":docNumSAP};

                    ////////console.log(data);

                    let configWs2:any = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                    }

                    //Validar existencia de de id aprobación
                    let response1 = await fetch(url2+`('${item.key}')`, configWs2);
                    let data1 = await response1.json();
                    ////console.log('GET',url2+`('${item.key}')`);
                    configWs2.body = JSON.stringify(data);
                    if(response1.status===200){
                        //existe id, acttualizar solped num
                        configWs2.method = 'PATCH'
                        ////console.log('PATCH',url2+`('${item.key}')`,configWs2);
                        let response2 = await fetch(url2+`('${item.key}')`, configWs2);
                        ////////console.log(response2.status)
                        if(response2.status===204){
                            arrayResult.push({
                                solped:idSolped,
                                sapdocnum:docNumSAP,
                                idaprobacion:item.key,
                                error:false,
                                message:`Actualizacón de linea aprobación ${item.key}` 
                            });
                            //////console.log(Solped);
                            let DocEntryOld:any = await helper.getSolpedByIdSL(infoUsuario,data1.U_NF_NUM_SOLPED_SAP,Solped.solped.serie)
                            await helper.CancelSolpedSAP(infoUsuario,DocEntryOld.value[0].DocEntry)
                        }else{
                            //Error al actualizar la linea de aprobacion
                            let data2 = await response2.json();
                            //////console.log('data2',data2)    
                            arrayResult.push({
                                solped:idSolped,
                                sapdocnum:docNumSAP,
                                idaprobacion:item.key,
                                error:true,
                                message:data2.error.message.value
                            });
                        }
                        //
                    }else{
                        //Registro la linea de aprobación
                        configWs2.method = 'POST'
                        //////console.log(configWs2);
                        let response3 = await fetch(url2, configWs2);
                        
                        let data3 = await response3.json();
                        //////console.log('data3',data3,response3.status);
                        if(response3.status!=201){
                            //Error en registro de linea
                            
                            arrayResult.push({
                                solped:idSolped,
                                sapdocnum:docNumSAP,
                                idaprobacion:item.key,
                                error:true,
                                message:data3.error.message.value
                            });
                            let DocEntryOld:any = await helper.getSolpedByIdSL(infoUsuario,data1.U_NF_NUM_SOLPED_SAP,Solped.solped.serie)
                            await helper.CancelSolpedSAP(infoUsuario,DocEntryOld.value[0].DocEntry)        
                        }else{
                            arrayResult.push({
                                solped:idSolped,
                                sapdocnum:docNumSAP,
                                idaprobacion:item.key,
                                error:false,
                                message:`Registro de linea aprobación ${item.key}` 
                            });
                        }
                    }
                    
                }
                */

                helper.logoutWsSAP(bieSession);
                ////////console.log(arrayResult);
                return arrayError;

            }

        } catch (error) {
            //////console.log(error);
            return '';
        }



    }

    async modeloAprobacionesMysql(infoUsuario: InfoUsuario):Promise<any> {
        
        const bdmysql = infoUsuario.bdmysql;
        const modelos = await db.query(`Select * from ${bdmysql}.modelos_aprobacion `);
        const data2 = modelos;

        let arrayModelos: any[] = [];

        for (let item in data2) {
            let pos_eq = data2[item].query.indexOf('=');
            let pos_quote = data2[item].query.indexOf(`'`, pos_eq);
            let pos_next_quote = data2[item].query.indexOf(`'`, pos_quote + 1);
            let area = data2[item].query.substring(pos_quote + 1, pos_next_quote);
            let numeric = data2[item].query.indexOf(`(19,6)`) + '(19,6)'.length + 1;
            let condicion = data2[item].query.substring(numeric, data2[item].query.length);  
            data2[item].area = area;
            data2[item].condicion = condicion;
            arrayModelos.push(data2[item]);
        }
        //////console.log(arrayModelos);
        return arrayModelos;
    }

    async modeloAprobacionesSAP(infoUsuario: InfoUsuario):Promise<any> {
               
        const compania = infoUsuario.dbcompanysap;
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
        ////console.log(url2);
        const response2 = await fetch(url2);
        //////console.log(response2.status)
        if(response2.status!=200){
           return {error: response2.statusText}
        }
        const data2 = await response2.json();

        let arrayModelos: any[] = [];

        for (let item in data2) {
            let pos_eq = data2[item].query.indexOf('=');
            let pos_quote = data2[item].query.indexOf(`'`, pos_eq);
            let pos_next_quote = data2[item].query.indexOf(`'`, pos_quote + 1);
            let area = data2[item].query.substring(pos_quote + 1, pos_next_quote);
            let numeric = data2[item].query.indexOf(`(19,6)`) + '(19,6)'.length + 1;
            let condicion = data2[item].query.substring(numeric, data2[item].query.length);  
            data2[item].area = area;
            data2[item].condicion = condicion;
            arrayModelos.push(data2[item]);
        }
       // ////console.log(arrayModelos);
        return arrayModelos;
    }

    async getEntradaById(idEntrada: string, bdmysql: string): Promise<any> {

        const entradaResult: any[] = await db.query(`
      
        SELECT T0.*, T1.*, T2.email 
        FROM ${bdmysql}.entrada T0 
        INNER JOIN ${bdmysql}.entrada_det T1 ON T0.id = T1.id_entrada 
        INNER JOIN users T2 ON T2.id = T0.id_user
        WHERE T0.id = ?`, [idEntrada]);

        ////////////console.log((solpedResult));

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
                GrossTotal: item.linegtotal,
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
                GrossTotal: item.linegtotal,
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

        //////////console.log(entradaObject,infoEntrada);

        return infoEntrada;
    }

    async getEntradaByDocNum(idEntrada: string, bdmysql: string): Promise<any> {

        const entradaResult: any[] = await db.query(`
      
        SELECT T0.*, T1.*, T2.email 
        FROM ${bdmysql}.entrada T0 
        INNER JOIN ${bdmysql}.entrada_det T1 ON T0.id = T1.id_entrada 
        INNER JOIN users T2 ON T2.id = T0.id_user
        WHERE T0.sapdocnum = ?`, [idEntrada]);

        //////console.log(entradaResult);

        

        return entradaResult;
    }

    async loadInfoEntradaSAPToJSONSAP(Entrada:any): Promise<any>{
        let dataEntradaJSONSAP:any;
        let DocumentLines:any[] =[];
        let DocumentLine:any;

        for(let item of Entrada.DocumentLines){
            DocumentLine={
                //LineNum:item.linenum,
                //Currency:item.trm===1?'$':item.moneda,
                //Currency:item.moneda==='COP'?'$':item.moneda,
                //Rate: item.trm,
                ItemDescription:item.ItemDescription,
                //RequiredDate:item.reqdatedet,
                //Quantity:item.cantidad,
                //Price:item.precio,
                UnitPrice:item.UnitPrice,
                LineTotal:item.LineTotal,
                //GrossTotal:item.linegtotal,
                TaxCode:item.TaxCode,
                CostingCode:item.CostingCode,
                CostingCode2:item.CostingCode2,
                CostingCode3:item.CostingCode3,
                WarehouseCode:item.WarehouseCode!==''?item.WarehouseCode:'SM_N300',
                BaseType:item.BaseType,
                BaseEntry:item.BaseEntry,
                BaseLine:item.BaseLine
                
            };

            if(item.ItemCode!=='' && Entrada.DocType=='dDocument_Items'){
                DocumentLine.ItemCode = item.ItemCode;
            }

            if(Entrada.DocType=='dDocument_Items'){
                DocumentLine.Quantity=item.Quantity;
            }
            
            if(item.AccountCode!==''){
                DocumentLine.AccountCode = item.AccountCode;
            }
            if(item.WarehouseCode===''){
                
                    DocumentLine.WarehouseCode = 'SM_N300';
                
            }else{
                DocumentLine.WarehouseCode = item.WarehouseCode;
            }

            DocumentLines.push(DocumentLine);
        }

        dataEntradaJSONSAP = {
               
            DocType:Entrada.DocType,
            //Series:Entrada.entrada.serie,
            DocDate: Entrada.DocDate,
            DocDueDate:Entrada.DocDueDate,
            //TaxDate:Entrada.entrada.taxdate,
            //RequriedDate:Entrada.entrada.reqdate,
            CardCode:Entrada.CardCode,
            CardName:Entrada.CardName,
            Comments:Entrada.Comments,
            JournalMemo:Entrada.JournalMemo,
            U_AUTOR_PORTAL:Entrada.U_AUTOR_PORTAL,
            /*U_NF_BIEN_OPORTUNIDAD:Entrada.U_NF_BIEN_OPORTUNIDAD,
            U_NF_SERVICIO_CALIDAD:Entrada.U_NF_SERVICIO_CALIDAD,
            U_NF_SERVICIO_TIEMPO:Entrada.U_NF_SERVICIO_TIEMPO,
            U_NF_SERVICIO_SEGURIDAD:Entrada.U_NF_SERVICIO_SEGURIDAD,
            U_NF_SERVICIO_AMBIENTE:Entrada.U_NF_SERVICIO_AMBIENTE,
            U_NF_TIPO_HE:Entrada.U_NF_TIPO_HE.charAt(0).toUpperCase(),
            U_NF_PUNTAJE_HE:Entrada.U_NF_PUNTAJE_HE,
            U_NF_CALIFICACION:Entrada.entrada.U_NF_CALIFICACION.charAt(0).toUpperCase(),
            ClosingRemarks:Entrada.entrada.footer,*/
            DocumentLines
            

        };

        return dataEntradaJSONSAP;
    }

    async loadInfoEntradaToJSONSAP(Entrada:any): Promise<any>{
        let dataEntradaJSONSAP:any;
        let DocumentLines:any[] =[];
        let DocumentLine:any;

        for(let item of Entrada.EntradaDet){
            DocumentLine={
                //LineNum:item.linenum,
                //Currency:item.trm===1?'$':item.moneda,
                Currency:item.moneda==='COP'?'$':item.moneda,
                //Rate: Entrada.entrada.trm, //item.trm,
                ItemDescription:item.dscription,
                //RequiredDate:item.reqdatedet,
                //Quantity:item.cantidad,
                //Price:item.precio,
                UnitPrice:item.precio,
                //LineTotal:item.linetotal,
                //GrossTotal:item.linegtotal,
                TaxCode:item.tax,
                CostingCode:item.ocrcode,
                CostingCode2:item.ocrcode2,
                CostingCode3:item.ocrcode3,
                WarehouseCode:item.whscode!==''?item.whscode:'SM_N300',
                BaseType:item.BaseType,
                BaseEntry:item.BaseEntry,
                BaseLine:item.linenum
                
            };

            if(item.itemcode!=='' && Entrada.entrada.doctype=='I'){
                DocumentLine.ItemCode = item.itemcode;
            }

            if(Entrada.entrada.doctype=='I'){
                DocumentLine.Quantity=item.cantidad;
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
                DocCurrency:Entrada.entrada.currency,
                //DocRate:Entrada.entrada.trm,
                //RequriedDate:Entrada.entrada.reqdate,
                CardCode:Entrada.entrada.codigoproveedor,
                CardName:Entrada.entrada.nombreproveedor,
                Comments:Entrada.entrada.comments,
                U_AUTOR_PORTAL:Entrada.entrada.usersap,
                U_NF_BIEN_OPORTUNIDAD:Entrada.entrada.U_NF_BIEN_OPORTUNIDAD,
                U_NF_SERVICIO_CALIDAD:Entrada.entrada.U_NF_SERVICIO_CALIDAD,
                U_NF_SERVICIO_TIEMPO:Entrada.entrada.U_NF_SERVICIO_TIEMPO,
                U_NF_SERVICIO_SEGURIDAD:Entrada.entrada.U_NF_SERVICIO_SEGURIDAD,
                U_NF_SERVICIO_AMBIENTE:Entrada.entrada.U_NF_SERVICIO_AMBIENTE,
                U_NF_TIPO_HE:Entrada.entrada.U_NF_TIPO_HE.charAt(0).toUpperCase(),
                U_NF_PUNTAJE_HE:Entrada.entrada.U_NF_PUNTAJE_HE,
                U_NF_CALIFICACION:Entrada.entrada.U_NF_CALIFICACION.charAt(0).toUpperCase(),
                ClosingRemarks:Entrada.entrada.footer,
                DocumentLines
                
    
            };

        ////////console.log(JSON.stringify(dataEntradaJSONSAP));
        ////////console.log(dataEntradaJSONSAP);

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

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getSolpedByIdSL(infoUsuario: InfoUsuario, DocNum: any, Serie:any ): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${Serie} and DocNum eq ${DocNum}&$select=DocEntry, DocNum`;
                ////console.log(url2);

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async consultarSolpedByIdSL(infoUsuario: any, DocEntry: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${DocEntry})`;
                //////console.log(url2);

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                ////////////console.log(response2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async anularSolpedByIdSL(infoUsuario: any, DocEntry: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${DocEntry})/Cancel`;
                //////console.log(url2);

                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                ////////////console.log(response2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async cerrarSolpedByIdSL(infoUsuario: any, DocEntry: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${DocEntry})/Close`;
                //////console.log(url2);

                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                ////////////console.log(response2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async reopenSolpedByIdSL(infoUsuario: any, DocEntry: any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests(${DocEntry})/Reopen`;
                //////console.log(url2);

                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                ////////////console.log(response2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async itemsSolpedXengine(compania:string):Promise<any>{
        
        try{
        //const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItems.xsjs?compania=${compania}`;
        const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsItemsSolped.xsjs?compania=${compania}`;
        


        //////console.log(url2);
        
    
            const response2 = await fetch(url2);
            ////console.log(response2.status);
            if(response2.status==200){
                const data2 = await response2.json();   
                return data2;
            }else{
                ////console.log(response2.statusText);
                return [];
            }
               

        }catch (error: any) {
            console.error(error);
            return (error);
        } 
    }

    async getPresupuesto(infoUsuario: InfoUsuario, idSolped:number,bdmysql:string, bdPresupuesto: string ){
        ////////console.log(infoUsuario.companyname.substring(0,8));
        let arrayErrorPresupuesto:any[]=[];
        let compania = infoUsuario.dbcompanysap;

        const dimensionesSolped :any[] = await db.query(`
      
        SELECT YEAR(t0.docdate) AS anio, t1.acctcode, t1.ocrcode2, SUM(t1.linetotal) AS subtotal, SUM(t1.linegtotal) AS total
        FROM ${bdmysql}.solped_det t1 
        INNER JOIN ${bdmysql}.solped t0 ON t1.id_solped = t0.id 
        WHERE t0.id = ${idSolped} 
        GROUP BY acctcode, ocrcode2, YEAR(t0.docdate)`, [idSolped]);

        let errorPresupuesto = false;
        let messageError = "";
        for(let lineaDimension of dimensionesSolped){
            //////////console.log(lineaDimension);
            const cuentaValidaPresupuesto = await helper.validaPresupuestoCuenta(compania, lineaDimension.acctcode);
            const presupuestoLineaDimensionSAP = await helper.getPresupuestoXE(infoUsuario.companyname.substring(0,8),lineaDimension,bdPresupuesto);
            const comprometidoAprobacionMysql = await helper.getPresupuestoSolpedEnAprobacion(lineaDimension,bdmysql,idSolped);
            ////////console.log(cuentaValidaPresupuesto,presupuestoLineaDimensionSAP, comprometidoAprobacionMysql,(presupuestoLineaDimensionSAP-comprometidoAprobacionMysql));
            if(lineaDimension.subtotal > (presupuestoLineaDimensionSAP-comprometidoAprobacionMysql) && cuentaValidaPresupuesto=='Y'){
                arrayErrorPresupuesto.push(`Cuenta: ${lineaDimension.acctcode} Dependencia: ${lineaDimension.ocrcode2} }`);
            }
        }

        return arrayErrorPresupuesto;

    }

    async validaPresupuestoCuenta(compania:string, cuenta:string){
        try {

            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsValidaCuentaPresupuesto.xsjs?pCompania=${compania}&pCuenta=${cuenta}`;
            //////console.log(url2);
            const response2 = await fetch(url2);
            const data2 = await response2.json();   
            ////////console.log('validaPresupuestoCuenta',data2);
            return (data2[0].Budget);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getPresupuestoSolpedEnAprobacion(lineaPresupuesto:any,bdmysql:string,idSolped:number){
        const {anio, acctcode, ocrcode2, ocrcode, subtotal, total} = lineaPresupuesto;
        let comprometidoAprobacion = 0;
            const queryComprometidoAprobacion :any[] = await db.query(`
      
        SELECT
            t0.id,
            YEAR(t0.docdate) AS anio, 
            t1.acctcode, 
            t1.ocrcode2, 

            SUM(t1.linetotal) AS subtotal, SUM(t1.linegtotal) AS total
            FROM ${bdmysql}.solped t0 
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            WHERE 
            t1.acctcode = ? AND

            t1.ocrcode2= ? AND
            YEAR(t0.docdate) = ? AND
            t0.approved ='P' AND
            t0.id <> ?
            GROUP BY t0.id, t1.acctcode, t1.ocrcode2, YEAR(t0.docdate)`, [acctcode,ocrcode2,anio,idSolped]);

            if(queryComprometidoAprobacion.length > 0) {
                comprometidoAprobacion = queryComprometidoAprobacion[0].subtotal;
            }

            return comprometidoAprobacion; 
    }

    async getPresupuestoXE(compania:string,lineaPresupuesto:any, bdPresupuesto:string): Promise<any>{
        try {

            const {anio, acctcode, ocrcode2, ocrcode, subtotal, total} = lineaPresupuesto

           
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNFPPTO.xsjs?pCompania=${bdPresupuesto}&pCuenta=${acctcode}&pAno=${anio}&pDependencia=${ocrcode2}&pLocalidad=${ocrcode}&pEmpresa=${compania}`;
            

            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getPresupuestoXE',data2);
                return (data2[0].Disponible);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async cancelarEntrada  (infoUsuario: InfoUsuario, dataCancel: any ): Promise<any> {
        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);


            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseDeliveryNotesService_Cancel2`;
                //////console.log(url2);
                let configWs2 = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    },
                    body: JSON.stringify(dataCancel)

                }
                
                const response2 = await fetch(url2, configWs2);
                let data2:any;
                if(response2.status ===204){
                    data2 = {
                        status:204
                    }
                }else{
                    data2 = await response2.json();
                }
                
                //const data2 = await response2.json();

                //////console.log(JSON.stringify(data2));

                
               // //////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }

    }

    async getEntradaByIdSL(infoUsuario: InfoUsuario, DocNum: any ): Promise<any> {

        //////////console.log(DocNum);

        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);


            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,BusinessPartners,PurchaseDeliveryNotes/DocumentLines,Users)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocDate,NumAtCard,DocCurrency,DocTotal,VatSum,Comments,ClosingRemarks,U_NF_PUNTAJE_HE,U_NF_CALIFICACION),BusinessPartners($select=CardCode,CardName,FederalTaxID,City,ContactPerson,Phone1,EmailAddress,MailAddress),PurchaseDeliveryNotes/DocumentLines($select=LineNum,ItemCode,ItemDescription,Quantity,Price,Currency,Rate,TaxCode,TaxPercentagePerRow,TaxTotal,LineTotal,GrossTotal,WarehouseCode,CostingCode,CostingCode2,CostingCode3),Users($select=UserCode,UserName)&$filter=PurchaseDeliveryNotes/CardCode eq BusinessPartners/CardCode and PurchaseDeliveryNotes/DocNum eq ${DocNum} and PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and PurchaseDeliveryNotes/UserSign eq Users/InternalKey`;
               // ////console.log(url2);
                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }
                
                const response2 = await fetch(url2, configWs2);
                ////////console.log(response2.status);
                const data2 = await response2.json();

                
               // //////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getEntradasByBaseDoc(infoUsuario: InfoUsuario, BaseEntry: any, BaseType:any ): Promise<any> {

        //////////console.log(DocNum);

        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);


            if (bieSession != '') {
                //const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,PurchaseDeliveryNotes/DocumentLines)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocumentStatus),PurchaseDeliveryNotes/DocumentLines($select=LineNum,LineStatus,ItemCode,ItemDescription,Quantity,UnitPrice,LineTotal)&$filter=PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and  PurchaseDeliveryNotes/DocumentLines/BaseType eq 22 and PurchaseDeliveryNotes/DocumentLines/BaseEntry eq ${DocEntry} and PurchaseDeliveryNotes/DocumentStatus eq 'O'`;
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,PurchaseDeliveryNotes/DocumentLines)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocumentStatus),PurchaseDeliveryNotes/DocumentLines($select=LineNum,LineStatus,BaseLine,ItemCode,ItemDescription,Quantity,UnitPrice,LineTotal,GrossTotal)&$filter=PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and  PurchaseDeliveryNotes/DocumentLines/BaseType eq ${BaseType} and PurchaseDeliveryNotes/DocumentLines/BaseEntry eq ${BaseEntry} `;
                ////////console.log(url2);
                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }
                
                const response2 = await fetch(url2, configWs2);
                ////////console.log(response2.status);
                const data2 = await response2.json();

                
               // //////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getEntradasByPedido(infoUsuario: InfoUsuario, DocEntry: any ): Promise<any> {

        //////////console.log(DocNum);

        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);


            if (bieSession != '') {
                //const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,PurchaseDeliveryNotes/DocumentLines)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocumentStatus),PurchaseDeliveryNotes/DocumentLines($select=LineNum,LineStatus,ItemCode,ItemDescription,Quantity,UnitPrice,LineTotal)&$filter=PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and  PurchaseDeliveryNotes/DocumentLines/BaseType eq 22 and PurchaseDeliveryNotes/DocumentLines/BaseEntry eq ${DocEntry} and PurchaseDeliveryNotes/DocumentStatus eq 'O'`;
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(PurchaseDeliveryNotes,PurchaseDeliveryNotes/DocumentLines)?$expand=PurchaseDeliveryNotes($select=DocEntry,DocNum,DocType,DocumentStatus),PurchaseDeliveryNotes/DocumentLines($select=LineNum,LineStatus,BaseLine,ItemCode,ItemDescription,Quantity,UnitPrice,LineTotal,GrossTotal)&$filter=PurchaseDeliveryNotes/DocEntry eq PurchaseDeliveryNotes/DocumentLines/DocEntry and  PurchaseDeliveryNotes/DocumentLines/BaseType eq 22 and PurchaseDeliveryNotes/DocumentLines/BaseEntry eq ${DocEntry} and PurchaseDeliveryNotes/CancelStatus eq 'csNo'`;
                ////////console.log(url2);
                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }
                
                const response2 = await fetch(url2, configWs2);
                ////////console.log(response2.status);
                const data2 = await response2.json();

                
               // //////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getCuentasXE(compania:string): Promise<any>{
        try {
           

            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsCuentasContables.xsjs?compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return data2;   

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }
   
    async getAreasUserXE(compania:string,codusersap:string): Promise<any>{
        try {

        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAreasSolpedXUsuario.xsjs?usuario=${codusersap}&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getSeriesXE(compania:string,objtype?:string): Promise<any>{
        try {

            let filtroObjtype = "";
            if(objtype) filtroObjtype = `&tipodoc=${objtype}`;

            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
            //////////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getTaxesXE(compania:string): Promise<any>{
        try {

        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsImpuestosCompras.xsjs?compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }
    async getTrmDiaXE(compania:string, fechaTrm:any): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsMonedas.xsjs?fecha=${(fechaTrm)}&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    } 

    async getModelosAPXE(compania:string): Promise<any>{
        try {

        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAprobaciones.xsjs?&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ///////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getProveedores2XE(compania: string): Promise<any>{
        try {

        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}`;
            ////console.log(url2);
           
        
                const response2 = await fetch(url2);

                if(response2.status===200){
                    const data2 = await response2.json();   
                    return (data2);
                }else{
                    return [];
                }
                   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

    async getDependenciasSL(compania: string): Promise<any>{
        const infoUsuario:any = {
            dbcompanysap:compania
        }
        const bieSession = await helper.loginWsSAP(infoUsuario);

        if (bieSession != '') {
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/RECC`;

            let configWs2 = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''
                }

            }
            
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();

            
           //////console.log(data2.value);
           helper.logoutWsSAP(bieSession);

            return data2.value;

        }
    }
    async getAlmacenes(compania: string): Promise<any>{
        try {

        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_MT_ALMACENES.xsjs?&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }
    

    async getCuentasDependenciasSL(compania: string): Promise<any>{
        const infoUsuario:any = {
            dbcompanysap:compania
        }
        const bieSession = await helper.loginWsSAP(infoUsuario);

        if (bieSession != '') {
            const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CDI2`;

            let configWs2 = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': bieSession || ''
                }

            }
            
            const response2 = await fetch(url2, configWs2);
            const data2 = await response2.json();

            
           //////console.log(data2.value);
           helper.logoutWsSAP(bieSession);

            return data2.value;

        }
    }

    
    async getStoresUserXE(compania:string,codusersap:string): Promise<any>{
        try {

         
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsAlmacenXUsuario.xsjs?usuario=${codusersap}&compania=${compania}`;
            ////console.log(url2); 
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    
    async getDependenciasUserXE(compania:string,codusersap:string): Promise<any>{
        try {

         
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsDependenciaXUsuario.xsjs?usuario=${codusersap}&compania=${compania}`; 
            ////console.log(url2); 
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////////console.log('getSeriesXE',data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getListaPreciosItemSAP(compania:string, itemCode:any): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_LISTAPCALCU.xsjs?material=${(itemCode)}&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                //////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    } 

    

    async getItemsMPbyItemPT(compania:string, itemCode:any): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_LISTAMATCALCU.xsjs?material=${(itemCode)}&compania=${compania}`;
            ////console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                //////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getPrecioVentaItemSAP(compania:string, itemCode:any, fechaInicio:string, fechaFin:string): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsPrecioUnitarioVentas.xsjs?pItem=${(itemCode)}&pCompania=${compania}&pfini=${fechaInicio.split("T")[0]}&pffin=${fechaFin.split("T")[0]}`;
            //console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                //////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }

    async getProyectosXE(compania:string): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_VISTAPROYECTOSPORTAL.xsjs?Compania=${compania}`;
            //console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                //////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }
    
    async getItemsMPCP(compania:string, tipo:any): Promise<any>{
        try {

            
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_MATERIALES.xsjs?tipo=${(tipo)}&compania=${compania}`;
            //console.log(url2);
            
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                ////console.log(data2);
                return (data2);  

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    } 


    async getUsuariosComprasAreaSL(infoUsuario: InfoUsuario,area:string): Promise<any>{
        try {


            const bieSession = await helper.loginWsSAP(infoUsuario);

            //https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(Users,USU,USU/NF_ALM_USUARIO_ACOMCollection)?$expand=Users($select=eMail)&$filter=USU/Code eq USU/NF_ALM_USUARIO_ACOMCollection/Code and USU/NF_ALM_USUARIO_ACOMCollection/U_NF_DIM_AREACOMP eq 'TECNOLOG' and Users/InternalKey eq USU/Code

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(Users,USU,USU/NF_ALM_USUARIO_ACOMCollection)?$expand=Users($select=eMail)&$filter=USU/Code eq USU/NF_ALM_USUARIO_ACOMCollection/Code and USU/NF_ALM_USUARIO_ACOMCollection/U_NF_DIM_AREACOMP eq '${area}' and Users/InternalKey eq USU/Code`;

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }
                
                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
               // //////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }
    }


    async getSolpedMPopenSL(infoUsuario: InfoUsuario, serie:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${serie} and DocumentStatus eq 'bost_Open' &$select=DocNum`;
                

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getAllSolpedMPopenSL(infoUsuario: InfoUsuario,serie:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series eq ${serie} and DocumentStatus eq 'bost_Open'`;
                ////console.log(url2);

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getAllSolpedNoMPopenSL(infoUsuario: InfoUsuario,serie:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseRequests?$filter=Series ne ${serie} and DocumentStatus eq 'bost_Open' and U_AUTOR_PORTAL ne null`;
                //////////console.log(url2);

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async sumarDiasFecha(fecha: any, dias:any): Promise<any> {


        try {

            fecha.setDate(fecha.getDate() + dias);
            return fecha;

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getOcMPByStatusSL(infoUsuario: InfoUsuario, status:string): Promise<any> {


        try {

            let serie =0;
            //let seriesDoc = await helper.getSeriesXE(infoUsuario.dbcompanysap,'22');
            let seriesDoc = await db.query(`select * from ${infoUsuario.bdmysql}.series where name ='OCM' `);
            /*for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='OCM'){
                    serie = seriesDoc[item].code;
                }
            }*/

            serie = seriesDoc[0].code;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders?$filter=Series eq ${serie} and DocumentStatus eq 'bost_Open' and U_NF_STATUS eq '${status}'`;
                //////////console.log(url2);
                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getEntradasMPSL(infoUsuario: InfoUsuario): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseDeliveryNotes?$filter=U_NF_PEDMP eq 'S' and DocumentStatus eq 'bost_Open'`;
                //////////console.log(url2);
                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getEntradasMPXE(infoUsuario: InfoUsuario): Promise<any> {


        try {

            const compania = infoUsuario.dbcompanysap;

            let serie =0;
            //let seriesDoc = await helper.getSeriesXE(infoUsuario.dbcompanysap,'22');
            let seriesDoc = await db.query(`select * from ${infoUsuario.bdmysql}.series where name ='OCM' `);
            /*for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='OCM'){
                    serie = seriesDoc[item].code;
                }
            }*/

            serie = seriesDoc[0].code;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsEntradasOpenMP.xsjs?compania=${compania}&serie=${serie}`;
            //////////console.log(url2);

        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 



    }


    async updatePedidoSAP(infoUsuario: InfoUsuario, data: any, docEntry:any): Promise<any> {


        try {

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders(${docEntry})`;

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

                

                //////////console.log(response2);
                helper.logoutWsSAP(bieSession);

                return response2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }


    async getInventariosMPXE(infoUsuario: InfoUsuario): Promise<any>{
        try {

            const compania = infoUsuario.dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_INV_CALCU.xsjs?compania=${compania}`;
            ////console.log(url2);

        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

    async getInventariosItemMPXE(infoUsuario: InfoUsuario, item:string,zona:string): Promise<any>{
        try {

            const compania = infoUsuario.dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_INV_CALCU.xsjs?compania=${compania}&material=${item}&zona=${zona}`;
            ////console.log(url2);

        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

   
    async getInventariosTrackingMPXE(infoUsuario: InfoUsuario): Promise<any>{
        try {

            const compania = infoUsuario.dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_SOLPED_PEDIDOSMP.xsjs?compania=${compania}`;
            ////console.log(url2);
           
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

    async getInventariosTrackingItemMPXE(infoUsuario: InfoUsuario,item:string,zona:string): Promise<any>{
        try {

            const compania = infoUsuario.dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsNF_SOLPED_PEDIDOSMP.xsjs?compania=${compania}&material=${item}&zona=${zona}`;
            ////console.log(url2);
           
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

    async getProveedoresXE(infoUsuario: InfoUsuario): Promise<any>{
        try {

            const compania = infoUsuario.dbcompanysap;
        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}`;
            ////console.log(url2);
           
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }

    async getCodigoSerie(dbcompanysap:any, tipoDoc:any, sirieStr:string){

        //////////console.log(dbcompanysap,tipoDoc,sirieStr);
        let serie =0;
            let seriesDoc = await helper.getSeriesXE(dbcompanysap,tipoDoc);
            for(let item in seriesDoc) {
                if(seriesDoc[item].name ===sirieStr){
                    serie = seriesDoc[item].code;
                }
            }
        return serie;
    }

    async getInventariosProyectados(infoUsuario: InfoUsuario): Promise<any>{
        try {

            const bdmysql = infoUsuario.bdmysql;

            /*let serie =0;
            let seriesDoc = await helper.getSeriesXE(infoUsuario.dbcompanysap,'1470000113');
            for(let item in seriesDoc) {
                if(seriesDoc[item].name ==='SPMP'){
                    serie = seriesDoc[item].code;
                }
            }*/

           

            //let proveedores = await helper.objectToArray(await helper.getProveedoresXE(infoUsuario));
        
            /*const query = `SELECT 
            'Proyectado' AS "TIPO",
            '' AS "CardCode",
            '' AS "CardName",
            t0.id AS "DocNum",
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
            '' AS "OpenCreQty",
            t1.linenum
            
            FROM ${bdmysql}.solped t0 
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            WHERE t0.serie = ${serie} AND 
            t0.sapdocnum =0 and t0.approved='N'`;*/

            const query = `SELECT 
            'Proyectado' AS "TIPO",
            '' AS "CardCode",
            '' AS "CardName",
            t0.id AS "DocNum",
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
            t3.CardName, 
            t1.itemcode AS "ItemCode",
            t1.whscode AS "WhsCode",
            t1.zonacode AS "State_Code",
            '' AS "PENTRADA",
            t1.quantity AS "Quantity",
            t1.price AS "Price",
            t1.trm AS "Rate",
            '' AS "OpenCreQty",
            t1.linenum
            
            FROM ${bdmysql}.solped t0 
            INNER JOIN ${bdmysql}.solped_det t1 ON t1.id_solped = t0.id
            INNER JOIN ${bdmysql}.series t2 ON t0.serie = t2.code
            LEFT OUTER JOIN ${bdmysql}.socios_negocio t3 ON t1.linevendor = t3.CardCode
            WHERE t2.name = 'SPMP' AND 
            t0.sapdocnum =0 and t0.approved='N'`;

            //////console.log(query);

            const solpeds = await db.query(query);

            /*for(let solped of solpeds) {
                if(solped.LineVendor!=''){
                    solped.CardName = proveedores.filter((data: { CardCode: any; }) =>data.CardCode === solped.LineVendor)[0].CardName;
                }
            }*/
        
                  
                return (solpeds);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }
    async documentsTracking(compania: string): Promise<any>{
        try {


        
            const url2 = `https://UBINITROFERT:nFtHOkay345$@nitrofert-hbt.heinsohncloud.com.co:4300/WSNTF/wsVistaCalculadora.xsjs?&compania=${compania}`;
            ////console.log(url2);
           
        
                const response2 = await fetch(url2);
                const data2 = await response2.json();   
                return (data2);   
    
            }catch (error: any) {
                console.error(error);
                return (error);
            } 
    }
    

    async covertirResultadoSLArray(data:any):Promise<any>{
        //////////console.log('Convertir SL to array');
        let dataArray:any[] =[];
    
        let lineaDetalleArray:any[] = [];


        for(let documento of data.value){
            
          
            
            if(documento.DocumentLines.length > 0){
                for(let lineaDetalle of documento.DocumentLines){
                    
                    if(lineaDetalle.LineStatus==='bost_Open'){
                        let  lineaArray ={
                            DocEntry:documento.DocEntry,
                            DocNum: documento.DocNum,
                            DocType:documento.DocType,
                            DocDate: documento.DocDate,
                            DocDueDate: documento.DocDueDate,
                            DocCurrency: documento.DocCurrency,
                            DocRate: documento.DocRate,
                            Reference1:documento.Reference1,
                            Comments: documento.Comments==null?'':documento.Comments,
                            Series:documento.Series,
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
                            U_NF_PEDMP: documento.U_NF_PEDMP,
                            
                            CardCode: '',
                            CardName: '',
                            ItemCode: '',
                            ItemDescription: '',
                            LineNum: 0,
                            MeasureUnit: '',
                            Quantity: 0,
                            RemainingOpenQuantity: 0,
                            approved:'S',
                            id:documento.DocEntry,
                            key:'0',
                            WarehouseCode:'',
                            ProveedorDS:'',
                            U_ID_PORTAL:''

            
                        };
    
                        lineaArray.CardCode = lineaDetalle.LineVendor==null?'':lineaDetalle.LineVendor;
                        lineaArray.ItemCode= lineaDetalle.ItemCode;
                        lineaArray.ItemDescription= lineaDetalle.ItemDescription==null?'':lineaDetalle.ItemDescription;
                        lineaArray.LineNum = lineaDetalle.LineNum;
                        lineaArray.MeasureUnit = lineaDetalle.MeasureUnit;
                        lineaArray.Quantity= lineaDetalle.Quantity;
                        lineaArray.RemainingOpenQuantity = lineaDetalle.RemainingOpenQuantity;
                        lineaArray.key =documento.DocEntry+'-'+documento.DocNum+'-'+lineaDetalle.LineNum;
                        lineaArray.WarehouseCode = lineaDetalle.WarehouseCode;
                        lineaArray.U_ID_PORTAL = lineaDetalle.U_ID_PORTAL==null?'':lineaDetalle.U_ID_PORTAL;
                        //////////console.log(lineaArray.LineNum);
                       
                        dataArray.push(lineaArray);
                    }

                    
                    
                }   
                
            }
            
            //break;
        }

        ////////////console.log(dataArray);
        ////////////console.log(dataArray.length);
        return dataArray;
    }

    async objectToArray(data:any):Promise<any>{
        let NewArray:any[] = [];

        for(let linea in data){
            NewArray.push(data[linea]);
        }

        return NewArray;
    }


    async permisoValidacionPresupuesto(compania:string){
        const query = `SELECT *
            
            FROM companies
            WHERE dbcompanysap = '${compania}' `;

            const empresa = await db.query(query);
            return empresa[0].validapresupuesto;
    }


    async registrarSeries(arraySeries:any[], bdmysql:string, objtype:string):Promise<void>{

        for (let serie of arraySeries){
                serie.objtype = objtype;
            let existeSerie = await db.query(`select * from ${bdmysql}.series t0 where t0.code=${serie.code}`);
            
            if(existeSerie.length==0){
                ////console.log('Registrar serie');
                await db.query(`insert into ${bdmysql}.series set ?`, [serie]);
            }
        }

    }

    async registrarCuentas(arrayCuentas:any[], bdmysql:string):Promise<void>{

        for (let cuenta of arrayCuentas){
               
            let existeCuenta = await db.query(`select * from ${bdmysql}.cuentas_contable t0 where t0.Code=${cuenta.Code}`);
            
            if(existeCuenta.length==0){
                ////console.log('Registrar cuenta');
                await db.query(`insert into ${bdmysql}.cuentas_contable set ?`, [cuenta]);
            }
        }

    }

    async registrarImpuestos(arrayImpuestos:any[], bdmysql:string):Promise<void>{

        for (let item of arrayImpuestos){
               
            let existeImpuesto = await db.query(`select * from ${bdmysql}.taxes t0 where t0.Code='${item.Code}'`);
            
            if(existeImpuesto.length==0){
                ////console.log('Registrar item');
                await db.query(`insert into ${bdmysql}.taxes set ?`, [item]);
            }
        }

    }

    async registrarItems(arrayItems:any[], bdmysql:string):Promise<void>{
        try{
            for (let item of arrayItems){
            //////console.log(item);   
            let existeItem = await db.query(`select * from ${bdmysql}.items_sap t0 where t0.ItemCode='${item.ItemCode}'`);
            
            if(existeItem.length==0){
                //////console.log('Registrar item');
                await db.query(`insert into ${bdmysql}.items_sap set ?`, [item]);
            }else{
                //////console.log((JSON.stringify(item) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(item) === JSON.stringify(existeItem[0]))){
                    ////console.log('Actualizar item');
                    await db.query(`update ${bdmysql}.items_sap set ? where ItemCode='${item.ItemCode}'`, [item]);
                }
            }
        }

    }catch (error: any) {
        console.error(error);
        //return res.json(error);
    }

    }
    async registrarModelosAP(arrayModelos:any[], bdmysql:string):Promise<void>{

        for (let modelo of arrayModelos){
            //////console.log(modelo);   
            let existeModelo = await db.query(`select * 
                                               from ${bdmysql}.modelos_aprobacion t0 
                                               where t0.modeloid=${modelo.modeloid} and 
                                                     t0.autorusercode = '${modelo.autorusercode}' and 
                                                     t0.etapaid=${modelo.etapaid} and 
                                                     t0.nivel = ${modelo.nivel}`);
            
            if(existeModelo.length==0){
                //////console.log('Registrar modelo');
                await db.query(`insert into ${bdmysql}.modelos_aprobacion set ?`, [modelo]);
            }else{
                //////console.log((JSON.stringify(modelo) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(modelo) === JSON.stringify(existeModelo[0]))){
                    //////console.log('Actualizar modelo');
                    await db.query(`update ${bdmysql}.modelos_aprobacion set ? where modeloid=${modelo.modeloid} and autorusercode = '${modelo.autorusercode}' and etapaid=${modelo.etapaid} and nivel = ${modelo.nivel}`, [modelo]);
                }
            }
        }

    }

    async registrarProveedores(arrayProveedores:any[], bdmysql:string):Promise<void>{

        for (let proveedor of arrayProveedores){
            //////console.log(modelo);   
            let existeProveedor = await db.query(`select * from ${bdmysql}.socios_negocio t0 where t0.CardCode='${proveedor.CardCode}' `);
            
            if(existeProveedor.length==0){
                ////console.log('Registrar proveedor');
                await db.query(`insert into ${bdmysql}.socios_negocio set ?`, [proveedor]);
            }else{
                //////console.log((JSON.stringify(modelo) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(proveedor) === JSON.stringify(existeProveedor[0]))){
                    ////console.log('Actualizar proveedor');
                    await db.query(`update ${bdmysql}.socios_negocio set ? where CardCode='${proveedor.CardCode}'`, [proveedor]);
                }
            }
        }

    }

    async registrarDependencias(arrayDependencias:any[], bdmysql:string):Promise<void>{

        for (let dependencia of arrayDependencias){
            ////console.log(dependencia);   
            let existeDependencia = await db.query(`select * from ${bdmysql}.dependencias t0 where t0.Code='${dependencia.Code}' `);

            let lineaDependencia:any = {
                Code:dependencia.Code,
                U_NF_DIM3_VICE:dependencia.U_NF_DIM3_VICE,
                U_NF_DIM2_DEP:dependencia.U_NF_DIM2_DEP,
                U_NF_DIM1_LOC:dependencia.U_NF_DIM1_LOC
            }  
            
            if(existeDependencia.length==0){
                ////console.log('Registrar proveedor');

                await db.query(`insert into ${bdmysql}.dependencias set ?`, [lineaDependencia]);
            }else{
                //////console.log((JSON.stringify(modelo) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(lineaDependencia) === JSON.stringify(existeDependencia[0]))){
                    ////console.log('Actualizar Dependencia');
                    await db.query(`update ${bdmysql}.dependencias set ? where Code='${dependencia.Code}'`, [lineaDependencia]);
                }
            }
        }

    }

    async registrarCuentasDependencias(arrayDependencias:any[], bdmysql:string):Promise<void>{

        for (let dependencia of arrayDependencias){
            //////console.log(dependencia);   
            

            for(let cuenta of dependencia.NF_RES_CTA_DIM2_DETCollection){

                if(cuenta.U_NF_CUENTA!=null){

                    let lineaCuentaDependencia:any = {
                        Code:dependencia.Code,
                        Name:dependencia.Name,
                        U_NF_CUENTA:cuenta.U_NF_CUENTA,
                        U_NF_NOMCUENTA:cuenta.U_NF_NOMCUENTA
                    }
    
                    let existeCuentaDependencia = await db.query(`select * 
                                                            from ${bdmysql}.cuentas_dependencias t0 
                                                            where t0.Code='${dependencia.Code}' and
                                                                  t0.U_NF_CUENTA = '${cuenta.U_NF_CUENTA}'`); 
                    
                    if(existeCuentaDependencia.length==0){
                        ////console.log('Registrar cuenta dependencia');
        
                        await db.query(`insert into ${bdmysql}.cuentas_dependencias set ?`, [lineaCuentaDependencia]);
                    }else{
                        //////console.log((JSON.stringify(lineaCuentaDependencia) === JSON.stringify(existeCuentaDependencia[0])));
                        if(!(JSON.stringify(lineaCuentaDependencia) === JSON.stringify(existeCuentaDependencia[0]))){
                            ////console.log('Actualizar cuenta Dependencia');
                            await db.query(`update ${bdmysql}.cuentas_dependencias set ? where Code='${dependencia.Code}' and U_NF_CUENTA = '${cuenta.U_NF_CUENTA}'`, [lineaCuentaDependencia]);
                        }
                    }
    
                }

                
                  
            }

            
            
            
        }

    }

    async registrarAlmacenes(arrayAlmacenes:any[], bdmysql:string):Promise<void>{

        for (let almacen of arrayAlmacenes){
            ////console.log(almacen);   
            let existeAlmacen = await db.query(`select * from ${bdmysql}.almacenes t0 where t0.WhsCode_Code='${almacen.WhsCode_Code}' `);
            
            if(existeAlmacen.length==0){
                ////console.log('Registrar Almancen');

                await db.query(`insert into ${bdmysql}.almacenes set ?`, [almacen]);
            }else{
                //////console.log((JSON.stringify(modelo) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(almacen) === JSON.stringify(existeAlmacen[0]))){
                    ////console.log('Actualizar Almancen');
                    await db.query(`update ${bdmysql}.almacenes set ? where Code='${almacen.WhsCode_Code}'`, [almacen]);
                }
            }
        }

    }

    
    async registrarTrmDia(arrayTrmDia:any[], fechaTrm:any):Promise<void>{
        for (let trmDia of arrayTrmDia){
            ////console.log(trmDia);   
            let existeTrmDia = await db.query(`select * 
                                                    from trm_dia_monedas t0
                                                    inner join monedas t1 ON t1.id = t0.monedaid 
                                                    where t1.Code='${trmDia.Currency}' and 
                                                          t0.fecha = '${fechaTrm}' `);

            let moneda = await db.query(`select * from monedas where Code='${trmDia.Currency}'`);
            ////console.log(moneda[0]);

            let lineaTrmDia:any = {
                monedaid:moneda[0].id,
                fecha:fechaTrm,
                TRM:trmDia.TRM
            }  
            
            if(existeTrmDia.length==0){
                ////console.log('Registrar proveedor');

                await db.query(`insert into trm_dia_monedas set ?`, [lineaTrmDia]);
                await db.query(`update monedas  set TRM = ? where id = ?`, [ trmDia.TRM,moneda[0].id]);
            }else{
                //////console.log((JSON.stringify(modelo) === JSON.stringify(existeItem[0])));
                if(!(JSON.stringify(trmDia) === JSON.stringify(existeTrmDia[0]))){
                    ////console.log('Actualizar Dependencia');
                    await db.query(`update trm_dia_monedas set ? where monedaid='${moneda[0].id}' and fecha = '${fechaTrm}'`, [lineaTrmDia]);
                    await db.query(`update monedas  set TRM = ? where id = ?`, [trmDia.TRM,moneda[0].id]);
                }
            }
        }
    }

    async registrarAreasUsuario(arrayAreas:any[],  companyid:number, userid:number):Promise<void>{

        for (let area of arrayAreas){
               
            let existeArea = await db.query(`select * 
                                             from areas_user t0 
                                             where t0.area = '${area.area}' and 
                                             t0.companyid=${companyid} and
                                             t0.userid=${userid} `);
            
            if(existeArea.length==0){
                if(area.area!=null){
                    
                    area.companyid=companyid;
                    area.userid = userid;
                    ////console.log('Registrar area',area);
                    await db.query(`insert into areas_user set ?`, [area]);
                }
                
            }
        }

    }
    
    
    async registrarStoresUsuario(arrayStores:any[],  companyid:number, userid:number):Promise<void>{

        for (let store of arrayStores){
               
            let existeStore = await db.query(`select * 
                                             from stores_users t0 
                                             where t0.store = '${store.store}' and 
                                             t0.companyid=${companyid} and
                                             t0.userid=${userid} `);
            
            if(existeStore.length==0){
                if(store.store!=null){
                    
                    store.companyid=companyid;
                    store.userid = userid;
                    ////console.log('Registrar store',store);
                    await db.query(`insert into stores_users set ?`, [store]);
                }
                
            }
        }

    }

    async registrarDependenciasUsuario(arrayDependencias:any[],  companyid:number, userid:number):Promise<void>{

        for (let dependencia of arrayDependencias){
               
            let existeDependencia = await db.query(`select * 
                                             from dependencies_user t0 
                                             where t0.dependence = '${dependencia.dependence}' and
                                             t0.location = '${dependencia.location}' and
                                             t0.vicepresidency = '${dependencia.vicepresidency}' and 
                                             t0.companyid=${companyid} and
                                             t0.userid=${userid} `);
            
            if(existeDependencia.length==0){
                if(dependencia.vicepresidency!=null){
                    
                    dependencia.companyid=companyid;
                    dependencia.userid = userid;
                    ////console.log('Registrar dependencia',dependencia);
                    await db.query(`insert into dependencies_user set ?`, [dependencia]);
                }
                
            }
        }

    }

    async fechaInicioSemana(fecha:Date):Promise<Date>{
        let fechaTMP:Date = new Date(fecha);
        let diaDeLaSemana = fecha.getUTCDay()==0?1:fecha.getUTCDay();
        let numeroDiasRestar = diaDeLaSemana-1;
        fechaTMP.setDate(fecha.getDate()-numeroDiasRestar);
        return fechaTMP;
    }
    
      async siguienteMes(fecha:Date){
        ////////console.log(fecha,fecha.getFullYear(),fecha.getMonth());
    
        let anioMesSiguiente:number = fecha.getMonth()==11?fecha.getFullYear()+1:fecha.getFullYear();
        let mesMesSiguiente:number = fecha.getMonth()==11?0:fecha.getMonth()+1;
        ////////console.log('año',anioMesSiguiente,'mes',mesMesSiguiente);
        let fechaInicioMesSiguiente = new Date(anioMesSiguiente, mesMesSiguiente,1);
    
        return fechaInicioMesSiguiente;
      }
    
      async semanaDelMes(fecha:Date):Promise<string>{
        let semanaMes:string ='';
        
        //let fechaInicioSemana = await this.fechaInicioSemana(new Date(fecha));
        let fechaInicioSemana = ((fecha));
        fechaInicioSemana.setHours(0,0,0);
        //////console.log('Inicio semana',fechaInicioSemana);
        //let siguienteMes = await this.siguienteMes(new Date(fecha));
        let siguienteMes = await this.siguienteMes((fecha));
        siguienteMes.setHours(0,0,0);
        //////console.log('Siguiente mes',siguienteMes);
    
        let fechaInicioSemanaSiguienteMes = await this.fechaInicioSemana((siguienteMes));
        fechaInicioSemanaSiguienteMes.setHours(0,0,0);
        //////console.log('fecha Inicio Semana Siguiente mes',fechaInicioSemanaSiguienteMes);
        //await ////console.log(fechaInicioSemana.getFullYear(),fechaInicioSemanaSiguienteMes.getFullYear(),fechaInicioSemana.getMonth(),fechaInicioSemanaSiguienteMes.getMonth(),fechaInicioSemana.getDate(),fechaInicioSemanaSiguienteMes.getDate());
    
        
        let diaDelMes = fechaInicioSemana.getDate();
        let diaFecha = fechaInicioSemana.getDay();
    
        
        let weekOfMonth = Math.ceil((diaDelMes - 1 - diaFecha) / 7);
        ////console.log(fechaInicioSemana,fechaInicioSemana.getMonth(),fechaInicioSemana.getMonth()+1);
        let mesStr = this.mesesAnio.filter(mes =>mes.mes === (fechaInicioSemana.getMonth()+1))[0].mesStr.substring(0,3).toUpperCase();
        
        if(fechaInicioSemana.getFullYear()===fechaInicioSemanaSiguienteMes.getFullYear() && fechaInicioSemana.getMonth() === fechaInicioSemanaSiguienteMes.getMonth() && fechaInicioSemana.getDate()===fechaInicioSemanaSiguienteMes.getDate()){
          weekOfMonth = 0;
          mesStr = this.mesesAnio.filter(mes =>mes.mes === (siguienteMes.getMonth()+1))[0].mesStr.substring(0,3).toUpperCase();
        }
    
        semanaMes = `${(weekOfMonth+1)}S - ${mesStr}`;
    
        return semanaMes;
      }
    
      async numeroDeSemana(fecha:any):Promise<number>{
        const DIA_EN_MILISEGUNDOS = 1000 * 60 * 60 * 24,
              DIAS_SEMANA = 7,
              JUEVES = 4;
    
        //let nuevaFecha:Date;
        //fecha = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
        //console.log(fecha);
        let diaDeLaSemana = fecha.getUTCDay(); // Domingo es 0, sábado es 6
        if (diaDeLaSemana === 1) {
            diaDeLaSemana = 7;
        }
        fecha.setUTCDate(fecha.getUTCDate() - diaDeLaSemana + JUEVES);
        const inicioDelAño:any = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 1));
        const diferenciaDeFechasEnMilisegundos = fecha - inicioDelAño;
        return Math.ceil(((diferenciaDeFechasEnMilisegundos / DIA_EN_MILISEGUNDOS) + 1) / DIAS_SEMANA);
      }
    



    

    /************** Seccion Liquitech *****************/

    async loginWsLQ(): Promise<any> {

        const jsonLog = {"username": "NITROFERTSAS", "password": "Nitrocredit2023*"};
        const url = `https://app.liquitech.co/api_urls/app_usuarios/usuario/login_user/`;

        let configWs = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonLog)
        }

        ////////////console.log(configWs);
        try {

            const response = await fetch(url, configWs);
            const data = await response.json();

            if (response.ok) {
                ////////////console.log('successfully logged  Liquitech');
                return  data;
                
            } else {

                return '';

            }
        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getTitulosLQ(token:string, nextPage:string): Promise<any> {

        
        const url = nextPage;

        let configWs = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer '+token
            }
        }

        ////////////console.log(configWs);
        try {

            const response = await fetch(url, configWs);
           

            if (response.ok) {
                //////////console.log('successfully logged  Liquitech');
                const data = await response.json();
                ////////////console.log(data);    
                return  data;
                
            } else {

                return '';

            }
        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getPagosLQ(token:string,nextPage:string): Promise<any> {

        
        const url = `${nextPage}`;

        let configWs = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer '+token
            }
        }

        ////////////console.log(configWs);
        try {

            const response = await fetch(url, configWs);
            const data = await response.json();

            if (response.ok) {
                ////////////console.log('successfully logged  Liquitech',response,data);
                
                return  data;
                
            } else {

                return '';

            }
        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getTituloById(no_titulo:any): Promise<any> {

        
        try {

            let infoUsuario: InfoUsuario ={
                id:           0,
                fullname:     '',
                email:        '',
                username:     'USERAPLICACIONES',
                codusersap:   'USERAPLICACIONES',
                status:       '',
                id_company:   0,
                companyname:  'NITROFERT_PRD',
                logoempresa:  '',
                bdmysql:      '',
                dbcompanysap: 'NITROFERT_PRD',
                urlwssap:''
            } ;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL?$filter=U_FACTURA eq '${no_titulo}'`;
                //////////console.log(url2);

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2);
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async getNitProveedorByTitulo(titulo:any): Promise<any> {

        
        try {

            let infoUsuario: InfoUsuario ={
                id:           0,
                fullname:     '',
                email:        '',
                username:     'USERAPLICACIONES',
                codusersap:   'USERAPLICACIONES',
                status:       '',
                id_company:   0,
                companyname:  'NITROFERT_PRD',
                logoempresa:  '',
                bdmysql:      '',
                dbcompanysap: 'NITROFERT_PRD',
                urlwssap:''
            } ;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(Invoices,BusinessPartners)?$expand=Invoices($select=DocEntry,DocNum),BusinessPartners($select=CardCode,FederalTaxID)&$filter=Invoices/CardCode eq BusinessPartners/CardCode and Invoices/DocNum eq ${titulo}`;

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2); 
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }

    async InsertTituloSL(data:any){
        try {

            let infoUsuario: InfoUsuario ={
                id:           0,
                fullname:     '',
                email:        '',
                username:     'USERAPLICACIONES',
                codusersap:   'USERAPLICACIONES',
                status:       '',
                id_company:   0,
                companyname:  'NITROFERT_PRD',
                logoempresa:  '',
                bdmysql:      '',
                dbcompanysap: 'NITROFERT_PRD',
                urlwssap:''
            } ;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL`;

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

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }

    }

    async UpdateTituloSL(data:any,DocEntry:any){
        try {

            let infoUsuario: InfoUsuario ={
                id:           0,
                fullname:     '',
                email:        '',
                username:     'USERAPLICACIONES',
                codusersap:   'USERAPLICACIONES',
                status:       '',
                id_company:   0,
                companyname:  'NITROFERT_PRD',
                logoempresa:  '',
                bdmysql:      '',
                dbcompanysap: 'NITROFERT_PRD',
                urlwssap:''
            } ;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/CXXL(${DocEntry})`;

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

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return response2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }

    }

    async getRefPagoTitulo(titulo:any, refPago:any): Promise<any> {

        
        try {

            let infoUsuario: InfoUsuario ={
                id:           0,
                fullname:     '',
                email:        '',
                username:     'USERAPLICACIONES',
                codusersap:   'USERAPLICACIONES',
                status:       '',
                id_company:   0,
                companyname:  'NITROFERT_PRD',
                logoempresa:  '',
                bdmysql:      '',
                dbcompanysap: 'NITROFERT_PRD',
                urlwssap:''
            } ;

            const bieSession = await helper.loginWsSAP(infoUsuario);

            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/$crossjoin(CXXL,CXXL/NF_CXC_LIQUITEC_DETCollection)?$expand=CXXL($select=DocEntry,DocNum,U_FACTURA),CXXL/NF_CXC_LIQUITEC_DETCollection($select=DocEntry,U_NF_REF_PAGO)&$filter=CXXL/DocEntry eq CXXL/NF_CXC_LIQUITEC_DETCollection/DocEntry and CXXL/U_FACTURA eq '${titulo}' and CXXL/NF_CXC_LIQUITEC_DETCollection/U_NF_REF_PAGO eq '${refPago}'`;

                let configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }

                }

                const response2 = await fetch(url2, configWs2); 
                const data2 = await response2.json();

                
                ////////////console.log(data2);
                helper.logoutWsSAP(bieSession);

                return data2;

            }

        } catch (error) {
            //////////console.log(error);
            return '';
        }



    }


    async cunsumirTitulosLQ(token:any): Promise<any> {

        
        try {

            //const titulos = await helper.getTitulosLQ(infoLog.data.access_token);
        let dataNewTitulo!:any ;
        let dataUpdateTitulo!:any ;
        let nextPage:any = `https://app.liquitech.co/api_urls/app_operaciones/titulos_negociacion/`;
        let titulos:any[] = [];
        let titulosUpdate:any[] = [];
        let titulosPage:any;
        let no_titulo:any;
        let tituloSap:any;
        let resultInsertTitulo:any;
        let resultUpdateTitulo:any;
        
        ////////////console.log(titulos.length,titulos.length); 

        let fechaEjecucion = new Date();
        ////console.log('Inicio Titulos: ');
        while(nextPage!=null){
             ////console.log(nextPage);
             titulosPage = await helper.getTitulosLQ(token,nextPage);
             
             //////console.log(titulosPage);

             if(titulosPage.results){
                for(let titulo of titulosPage.results){
                    //////console.log('Titulo: ',titulo.no_titulo);
                    //////console.log('Estado titulo: ',titulo.estado);
                    if(titulo.no_titulo==12879){
                        ////console.log('Titulo: ',titulo.no_titulo);
                        ////console.log('Estado titulo: ',titulo.estado);
                    }

                    if(titulo.estado=='aprobado' || titulo.estado=='desembolsado' || titulo.estado=='abonado' || titulo.estado=='pagado'){
                        no_titulo = titulo.no_titulo;

                        //Parcialmente comentado para pureba de webservice 

                        /*
                        tituloSap = await helper.getTituloById(no_titulo);  

                        ////////////console.log(titulo);
                        if(tituloSap.value.length==0){
                            //Insertar factura en udo
                        
                            let nit_pagador_sap = await helper.getNitProveedorByTitulo(no_titulo);
                            
                            dataNewTitulo = {
                                U_NIT:nit_pagador_sap.value[0].BusinessPartners.FederalTaxID,
                                U_FECHA_FACT: titulo.fecha_emision,
                                U_TOTAL:titulo.valor_titulo,
                                U_FACTURA:titulo.no_titulo,
                                U_NF_ESTADO_APROBADO: titulo.estado=='aprobado'?'SI':'NO',
                                U_NF_ESTADO_DESEMBOLSADO: titulo.estado=='desembolsado'?'SI':'NO',
                                U_NF_ESTADO_ABONADO: titulo.estado=='abonado'?'SI':'NO',
                                U_NF_ESTADO_PAGADO: titulo.estado=='pagado'?'SI':'NO',
                                U_NF_CUFE_FV:titulo.cufe,
                                U_NF_FECHA_PAGO:titulo.fecha_pago,
                                U_NF_FECHA_NEGOCIACION:titulo.fecha_negociacion,
                                U_NF_VALOR_GIRO:titulo.valor_giro
                            }
        
                            //resultInsertTitulo = await helper.InsertTituloSL(dataNewTitulo);  //Parcialmente comentado para pureba de webservice
        
                            titulos.push(titulo)
            
                        }else{
                            //Update estado cabecera titulo
                            dataUpdateTitulo={
                                U_NF_ESTADO_APROBADO: titulo.estado=='aprobado'?'SI':'NO',
                                U_NF_ESTADO_DESEMBOLSADO: titulo.estado=='desembolsado'?'SI':'NO',
                                U_NF_ESTADO_ABONADO: titulo.estado=='abonado'?'SI':'NO',
                                U_NF_ESTADO_PAGADO: titulo.estado=='pagado'?'SI':'NO',
                                U_NF_CUFE_FV:titulo.cufe,
                                U_NF_FECHA_PAGO:titulo.fecha_pago,
                                U_NF_FECHA_NEGOCIACION:titulo.fecha_negociacion,
                                U_NF_VALOR_GIRO:titulo.valor_giro
                            };
        
                            //resultUpdateTitulo = await helper.UpdateTituloSL(dataUpdateTitulo,tituloSap.value[0].DocEntry);  //Parcialmente comentado para pureba de webservice
                            ////////////console.log(resultUpdateTitulo);
        
                            titulosUpdate.push(titulo);
                        }

                        */
                    }
                    
                 }
    
                 nextPage = titulosPage.next;
             }else{
                nextPage=null;
             }
             
        }

        let fechaFinalizacion = new Date();


        //Envio Notificcación registros 

        //Parcialmente comentado para pureba de webservice
        /*
        let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
                    <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>`;

        if(titulos.length>0){
            html = html+`<h4>Títulos registrados</h4><br>${JSON.stringify(titulos)}<br>`;
        }

        if(titulosUpdate.length>0){
            html = html+`<h4>Títulos actualizados</h4><br>${JSON.stringify(titulosUpdate)}<br>`;
        }

        if(titulos.length == titulosUpdate.length && titulosUpdate.length ==0){
            html = html+`<h4>No se encontraron títulos a registrar</h4><br>`;
        }

        let infoEmail:any = {
            //to: LineAprovedSolped.aprobador.email,
            to:'ralbor@nitrofert.com.co',
            cc:'aballesteros@nitrofert.com.co',
            subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
            html
        }
        //Envio de notificación al siguiente aprobador con copia al autor
        await helper.sendNotification(infoEmail);
        
        */

        return ({'Titulos registrados':titulos,'Titulos actualizados':titulosUpdate}); 


        } catch (error) {
            //////////console.log(error);
            let infoEmail:any = {
                //to: LineAprovedSolped.aprobador.email,
                to:'ralbor@nitrofert.com.co',
                cc:'aballesteros@nitrofert.com.co',
                subject: `Notificación de ejecución interfaz de titulos Liquitech - Ntrocredit`,
                html:error
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            return '';
        }



    }

    async cunsumirPagosLQ(token:any): Promise<any> {

        
        try {

            let fechaEjecucion = new Date();
        
        
            let fechaFinPago = new Date();
            let fechaFinPagoFormat = `${fechaFinPago.getFullYear()}-${fechaFinPago.getMonth()+1}-${fechaFinPago.getUTCDate()}` ;
            let fechaInicioPago = await helper.sumarDiasFecha(new Date(),-100);
            let fechaInicioPagoFormat = `${fechaInicioPago.getFullYear()}-${fechaInicioPago.getMonth()+1}-${fechaInicioPago.getUTCDate()}` ;
            //////////console.log(fechaFinPagoFormat,fechaInicioPagoFormat);
    
            //?fecha_pago_i=2022-09-01&fecha_pago_f=2022-11-30
    
            let nextPage:any = `https://app.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/?fecha_pago_i=${fechaInicioPagoFormat}&fecha_pago_f=${fechaFinPagoFormat}`;
        
            //let nextPage:any = `https://dev.liquitech.co/api_urls/app_operaciones/titulos_negociacion/listar_pagos/`;
            //////////console.log(nextPage); 
            let pagos:any[] = [];
            let pagosPage:any;
            let refPago:any;
            let dataNewPago:any;
            let tituloSap:any;
            let pagosTitulo:any[];
            let DocEntry:any;
            ////console.log('Inicio Pagos: ');
            while(nextPage!=null){
                //////console.log(nextPage);
                pagosPage = await helper.getPagosLQ(token,nextPage);
                ////console.log(pagosPage);
                if(pagosPage.results){
                    for(let pago of pagosPage.results){
                        ////////////console.log(pago);
                        //////console.log('Pago: ',pago.referencia_pago);
                        //////console.log('Pago titulo: ',pago.no_titulo);
                        
                        if(pago.valor_pagado!=0 && pago.referencia_pago!=''){
                            //Buscar titulo en SAP

                            //Parcialmente comentado para pureba de webservice

                            /*
                            tituloSap = await helper.getTituloById(pago.no_titulo);
                            if(tituloSap.value.length>0){
                                
                                ////////////console.log(tituloSap);
                                pagosTitulo = tituloSap.value[0].NF_CXC_LIQUITEC_DETCollection;
                                DocEntry = tituloSap.value[0].DocEntry;
        
                                dataNewPago ={
                                    
                                    "U_NF_SALDO_LIQUITECH":pago.saldo_favor,
                                    "NF_CXC_LIQUITEC_DETCollection": [
                                        {
                                            "U_FECHA_PAGO": pago.fecha_pago,
                                            "U_VALOR_PAGO": pago.valor_pagado,
                                            "U_NF_REF_PAGO":pago.referencia_pago
                                        }
                                    ]
                                
                                };
        
        
                                if(pagosTitulo.length==0 ||  pagosTitulo.filter(item =>item.U_NF_REF_PAGO==pago.referencia_pago).length==0){
                                    //////////console.log(dataNewPago);
                                    //Insertar pago a titulo
                                    await helper.UpdateTituloSL(dataNewPago,DocEntry);
                                    pagos.push(pago);
                                }
        
                            }
                            */
                          
                        }
                    }
        
                    nextPage = pagosPage.next===undefined?null:pagosPage.next;
                }else{
                    nextPage=null;
                }
                
            }
            
            //Parcialmente comentado para pureba de webservice

            /*
            let fechaFinalizacion = new Date();
            let html = `<h4>Fecha de ejecución:</h4> ${fechaEjecucion}<br>
            <h4>Fecha de finalización:</h4> ${fechaFinalizacion}<br>
            <h4>Fecha de incio pagos:</h4> ${fechaInicioPago.toLocaleDateString().toString()}<br>
            <h4>Fecha de fin pagos:</h4> ${fechaFinPago.toLocaleDateString().toString()}<br>`;
    
            if(pagos.length>0){
            html = html+`<h4>Pagos registrados</h4><br>${JSON.stringify(pagos)}<br>`;
            }else{
                html = html+`<h4>No se encontraron pagos a registrar</h4><br>`;
            }
    
           
    
            let infoEmail:any = {
            //to: LineAprovedSolped.aprobador.email,
            to:'ralbor@nitrofert.com.co',
            cc:'aballesteros@nitrofert.com.co',
            subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
            html
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            */
    
            return (pagos);


        } catch (error) {
            //////////console.log(error);
            let infoEmail:any = {
                //to: LineAprovedSolped.aprobador.email,
                to:'ralbor@nitrofert.com.co',
                cc:'aballesteros@nitrofert.com.co',
                subject: `Notificación de ejecución interfaz de pagos Liquitech - Ntrocredit`,
                html:error
            }
            //Envio de notificación al siguiente aprobador con copia al autor
            await helper.sendNotification(infoEmail);
            return '';
        }



    }



   


    /************************************* */

    








   



}
const helper = new Helpers();
export default helper;