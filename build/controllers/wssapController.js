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
const https_1 = __importDefault(require("https"));
const database_1 = require("../database");
const helpers_1 = __importDefault(require("../lib/helpers"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class WssapController {
    constructor() {
        this.url_sap_xe = 'https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/';
        this.url_sap_sl = 'https://137.116.33.72:50000/b1s/v1/';
        this.ip_nitrofert_hbt = '137.116.33.72';
    }
    BusinessPartners(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("BusinessPartners ",bieSession);
                if (bieSession != '') {
                    const url2 = `https://137.116.33.72:50000/b1s/v1/BusinessPartners?$filter=startswith(CardCode,'P'), CardType eq 'cSupplier'&$select=CardCode,CardName`;
                    //const url2 = `https://137.116.33.72:50000/b1s/v1/BusinessPartners?$filter=CardCode eq 'PN830511745'&$select=CardCode,CardName`;
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2.value);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2.value);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    Items(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/Items?$select=ItemCode,ItemName,ApTaxCode&$orderby=ItemCode`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2.value);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2.value);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    Cuentas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/ChartOfAccounts?$select=Code,Name&$orderby=Code`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2.value);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2.value);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    CuentasXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsCuentasContables.xsjs?compania=${compania}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    itemsSolpedXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                //const data = await helper.itemsSolpedXengine(compania);
                //return res.json(data);  
                //const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsItems.xsjs?compania=${compania}`;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsItemsSolped.xsjs?compania=${compania}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    itemsXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsItems.xsjs?compania=${compania}`;
                //const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsItemsSolped.xsjs?compania=${compania}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    monedasXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                let { fechaTrm } = req.params;
                //console.log(await helper.format(fechaTrm));
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsMonedas.xsjs?fecha=${yield helpers_1.default.format(fechaTrm)}&compania=${compania}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    SeriesXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                let { objtype } = req.params;
                let filtroObjtype = "";
                if (objtype)
                    filtroObjtype = `&tipodoc=${objtype}`;
                //console.log(await helper.format(fechaTrm));
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    Series(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                let { objtype } = req.params;
                let filtroObjtype = "";
                if (objtype)
                    filtroObjtype = `&tipodoc=${objtype}`;
                //console.log(await helper.format(fechaTrm));
                /*
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
                console.log(url2);
                
            
                const response2 = await fetch(url2);
                const data2 = await response2.json();
                return res.json(data2);*/
                const series = yield database_1.db.query(`Select * from ${bdmysql}.series t0 where t0.objtype ='${objtype}'`);
                //console.log(series);
                return res.json(series);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    BusinessPartnersXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                let { id } = req.params;
                //console.log(id);
                let proveedor = '';
                let proveedores = yield helpers_1.default.getProveedoresXE(infoUsuario[0]);
                /*const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}${proveedor}`;
                const response2 = await fetch(url2);
                const data2 = await response2.json();*/
                return res.json(proveedores);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    sociosDeNegocio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                const bdmysql = infoUsuario[0].bdmysql;
                const proveedores = yield database_1.db.query(`Select * From ${bdmysql}.socios_negocio t0`);
                return res.json(proveedores);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    AprobacionesXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const compania = infoUsuario[0].dbcompanysap;
                let { id } = req.params;
                //console.log(id);
                let proveedor = '';
                let querys = `SELECT * FROM "PRUEBAS_NITROFERT_PRD"."OITM"`;
                //console.log(querys);
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsAprobaciones.xsjs?&querys=${querys}`;
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    OrdenesUsuarioAreaXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const compania = infoUsuario[0].dbcompanysap;
                const userSap = infoUsuario[0].codusersap;
                const area = req.params.area;
                //console.log(await helper.format(fechaTrm));
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsOcAbiertasArea.xsjs?compania=${compania}&area=${area}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                console.log(response2, data2);
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    OrdenesUsuarioXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                //console.log(infoUsuario);
                const compania = infoUsuario[0].dbcompanysap;
                const userSap = infoUsuario[0].codusersap;
                //console.log(await helper.format(fechaTrm));
                const url2 = `https://UBINITROFERT:nFtHOkay345$@137.116.33.72:4300/WSNTF/wsOcAbiertasPorUsuario.xsjs?compania=${compania}&usuario=${userSap}`;
                console.log(url2);
                const response2 = yield (0, node_fetch_1.default)(url2, { agent: new https_1.default.Agent({ rejectUnauthorized: false, }) });
                const data2 = yield response2.json();
                //console.log(data2);   
                return res.json(data2);
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    OrdenesUsuarioSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                const perfilesUsuario = yield helpers_1.default.getPerfilesUsuario(decodedToken.userId);
                //console.log("Items",bieSession);
                let filtroPorUsuario = "";
                if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                    filtroPorUsuario = ` and PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL eq '${infoUsuario[0].codusersap}' `;
                }
                let data = {
                    QueryPath: `$crossjoin(PurchaseOrders,PurchaseOrders/DocumentLines)`,
                    QueryOption: `$expand=PurchaseOrders($select=DocEntry,DocNum,Series,DocDate,DocDueDate,CardCode,CardName,DocTotal,Comments),
                                  PurchaseOrders/DocumentLines($select=LineNum,
                                                                       LineStatus,
                                                                       ItemCode,
                                                                       ItemDescription,
                                                                       Quantity,
                                                                       ShipDate,
                                                                       Currency,
                                                                       Price,
                                                                       LineTotal,
                                                                       TaxCode,
                                                                       TaxTotal,
                                                                       GrossTotal,
                                                                       WarehouseCode,
                                                                       CostingCode,
                                                                       CostingCode2,
                                                                       CostingCode3,
                                                                       U_ID_PORTAL,
                                                                       U_NF_NOM_AUT_PORTAL)
                           &$filter=PurchaseOrders/DocEntry eq PurchaseOrders/DocumentLines/DocEntry  and 
                                    PurchaseOrders/DocumentLines/LineStatus eq 'O' and 
                                    PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL ne null
                                    ${filtroPorUsuario}`
                };
                //console.log(data);
                if (bieSession != '') {
                    const configWs2 = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        body: JSON.stringify(data),
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/QueryService_PostQuery`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2.value);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    PedidoByIdSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                let { pedido } = req.params;
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/PurchaseOrders(${pedido})`;
                    console.log(url2);
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getAreasSolpedSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                let { pedido } = req.params;
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    //const url2 = `https://137.116.33.72:50000/b1s/v1/USU?$select=NF_ALM_USUARIOS_SOLCollection`;
                    const url2 = `https://137.116.33.72:50000/b1s/v1/$crossjoin(USU,USU/NF_ALM_USUARIOS_SOLCollection)?$expand=USU/NF_ALM_USUARIOS_SOLCollection($select=U_NF_DIM2_DEP)&$filter=USU/Code eq USU/NF_ALM_USUARIOS_SOLCollection/Code and USU/NF_ALM_USUARIOS_SOLCollection/U_NF_DIM2_DEP ne null`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getUnidadItemSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                let { ItemCode } = req.params;
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/Items?$filter=ItemCode eq '${ItemCode}'&$select=PurchaseUnit`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    getAlmacenesMPSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            try {
                const infoUsuario = yield helpers_1.default.getInfoUsuario(decodedToken.userId, decodedToken.company);
                const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario[0]);
                //console.log("Items",bieSession);
                if (bieSession != '') {
                    const configWs2 = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'cookie': bieSession || ''
                        },
                        agent: new https_1.default.Agent({ rejectUnauthorized: false, })
                    };
                    const url2 = `https://137.116.33.72:50000/b1s/v1/Warehouses?$filter=Inactive eq 'N' and startswith(WarehouseCode,'AD') or   startswith(WarehouseCode,'TR')&$select=State,WarehouseCode,WarehouseName`;
                    const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                    const data2 = yield response2.json();
                    //console.log(data2);
                    helpers_1.default.logoutWsSAP(bieSession);
                    return res.json(data2);
                }
                return res.json({ error: 501 });
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
}
const wssapController = new WssapController();
exports.default = wssapController;
