import { Request, Response } from "express";
import { db } from "../database";
import { CompanyInterface } from "../interfaces/company.interface";
import { DecodeTokenInterface, InfoUsuario, PerfilesUsuario } from "../interfaces/decodedToken.interface";
import helper from "../lib/helpers";
import fetch from 'node-fetch';
import { DocumentLine, PurchaseRequestsInterface } from "../interfaces/purchaseRequest.interface";


class ReportesController {

    public async evaluacionProveedores(req: Request, res: Response) {
        try {
            
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //******************************************************* */
            
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario: PerfilesUsuario[] =  await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            let parametros = req.body;

            const { fechainicio, fechafin, proveedor, tipo } = parametros;

            console.log(fechainicio, fechafin, proveedor, tipo);

            if(proveedor!=''){
                where+=` AND t0.codigoproveedor = '${proveedor}' `;
            }

            
        

            //console.log(decodedToken);
            let query = `SELECT t0.codigoproveedor AS 
                                CardCode,t0.nombreproveedor AS CardName, 
                                COUNT(DISTINCT t0.sapdocnum) AS entradas,
                                COUNT(DISTINCT t0.pedidonumsap) AS pedidos,
                                AVG(IFNULL(U_NF_PUNTAJE_HE,0)) AS puntaje,
                                CASE WHEN (AVG(IFNULL(U_NF_PUNTAJE_HE,0)))>=90 THEN "Exelente"
                                    WHEN (AVG(IFNULL(U_NF_PUNTAJE_HE,0)))>=60 THEN "Bueno"
                                    ELSE "Regular" END AS Calificacion
                                    

                                FROM ${bdmysql}.entrada t0
                                WHERE t0.docdate BETWEEN '${fechainicio}' AND '${fechafin}'
                                ${where} 
                                GROUP BY codigoproveedor,nombreproveedor`;

            //console.log(queryList);

            const resultQuery = await db.query(query);
            console.log(resultQuery);
            res.json(resultQuery);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }

    public async detalleEntradasProveedor(req: Request, res: Response) {
        try {
            
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = await helper.validateToken(jwt);

            //******************************************************* */
            
            const infoUsuario= await helper.getInfoUsuario(decodedToken.userId,decodedToken.company);
            const bdmysql = infoUsuario[0].bdmysql;
            const perfilesUsuario: PerfilesUsuario[] =  await helper.getPerfilesUsuario(decodedToken.userId);
            let where = "";

            let parametros = req.body;

            const { fechainicio, fechafin, proveedor, tipo } = parametros;

            //console.log(fechainicio, fechafin, proveedor, tipo);

            if(proveedor!=''){
                where+=` AND t0.codigoproveedor = '${proveedor}' `;
            }

            
        

            //console.log(decodedToken);
            let query = `SELECT t0.pedidonumsap AS pedido,
                        t0.sapdocnum AS DocNum,
                        t0.U_NF_TIPO_HE AS Tipo,
                        t0.U_NF_BIEN_OPORTUNIDAD AS Oportunidad,
                        t0.U_NF_SERVICIO_CALIDAD AS Calidad,
                        t0.U_NF_SERVICIO_TIEMPO AS Tiempo,
                        t0.U_NF_SERVICIO_SEGURIDAD AS Seguridad,
                        t0.U_NF_SERVICIO_AMBIENTE AS Ambiente,
                        t0.U_NF_PUNTAJE_HE AS Puntaje,
                        t0.U_NF_CALIFICACION AS Calificacion
            
                                FROM ${bdmysql}.entrada t0
                                WHERE t0.docdate BETWEEN '${fechainicio}' AND '${fechafin}'
                                ${where}`;

            console.log(query);

            const resultQuery = await db.query(query);
            console.log(resultQuery);
            res.json(resultQuery);     

        }catch (error: any) {
            console.error(error);
            return res.json(error);
        }
    }



    

}

const reportesController = new ReportesController();
export default reportesController; 