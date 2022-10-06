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
const helpers_1 = __importDefault(require("../lib/helpers"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class WssapController {
    constructor() {
        this.url_sap_xe = 'http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/';
        this.url_sap_sl = 'https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/';
    }
    BusinessPartners(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            //console.log("BusinessPartners ",bieSession);
            if (bieSession != '') {
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/BusinessPartners?$filter=startswith(CardCode,'P'), CardType eq 'cSupplier'&$select=CardCode,CardName`;
                //const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/BusinessPartners?$filter=CardCode eq 'PN830511745'&$select=CardCode,CardName`;
                const configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }
                };
                const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                const data2 = yield response2.json();
                //console.log(data2.value);
                helpers_1.default.logoutWsSAP(bieSession);
                return res.json(data2.value);
            }
            return res.json({ error: 501 });
        });
    }
    Items(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            //console.log("Items",bieSession);
            if (bieSession != '') {
                const configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }
                };
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Items?$select=ItemCode,ItemName,ApTaxCode&$orderby=ItemCode`;
                const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                const data2 = yield response2.json();
                //console.log(data2.value);
                helpers_1.default.logoutWsSAP(bieSession);
                return res.json(data2.value);
            }
            return res.json({ error: 501 });
        });
    }
    Cuentas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            //console.log("Items",bieSession);
            if (bieSession != '') {
                const configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }
                };
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/ChartOfAccounts?$select=Code,Name&$orderby=Code`;
                const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                const data2 = yield response2.json();
                //console.log(data2.value);
                helpers_1.default.logoutWsSAP(bieSession);
                return res.json(data2.value);
            }
            return res.json({ error: 501 });
        });
    }
    CuentasXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsCuentasContables.xsjs?compania=${compania}`;
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
    itemsXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsItems.xsjs?compania=${compania}`;
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
    monedasXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            let { fechaTrm } = req.params;
            //console.log(await helper.format(fechaTrm));
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsMonedas.xsjs?fecha=${yield helpers_1.default.format(fechaTrm)}&compania=${compania}`;
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
    SeriesXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            let { objtype } = req.params;
            let filtroObjtype = "";
            if (objtype)
                filtroObjtype = `&tipodoc=${objtype}`;
            //console.log(await helper.format(fechaTrm));
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsSeries.xsjs?compania=${compania}${filtroObjtype}`;
            console.log(url2);
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
    BusinessPartnersXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            let { id } = req.params;
            //console.log(id);
            let proveedor = '';
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsConsultaTodosProveedores.xsjs?&compania=${compania}${proveedor}`;
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
    AprobacionesXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            let { id } = req.params;
            //console.log(id);
            let proveedor = '';
            let querys = `SELECT * FROM "PRUEBAS_NITROFERT_PRD"."OITM"`;
            //console.log(querys);
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsAprobaciones.xsjs?&querys=${querys}`;
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
    OrdenesUsuarioXE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const compania = infoUsuario.dbcompanysap;
            const userSap = infoUsuario.codusersap;
            //console.log(await helper.format(fechaTrm));
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/wsOcAbiertasPorUsuario.xsjs?compania=${compania}&usuario=${userSap}`;
            try {
                const response2 = yield (0, node_fetch_1.default)(url2);
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
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            const perfilesUsuario = decodedToken.perfilesUsuario;
            //console.log("Items",bieSession);
            let filtroPorUsuario = "";
            if (perfilesUsuario.filter(perfil => perfil.perfil !== 'Administrador').length > 0) {
                filtroPorUsuario = ` and PurchaseOrders/DocumentLines/U_NF_NOM_AUT_PORTAL eq '${infoUsuario.codusersap}' `;
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
                    body: JSON.stringify(data)
                };
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/QueryService_PostQuery`;
                const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                const data2 = yield response2.json();
                //console.log(data2);
                helpers_1.default.logoutWsSAP(bieSession);
                return res.json(data2.value);
            }
            return res.json({ error: 501 });
        });
    }
    PedidoByIdSL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            const perfilesUsuario = decodedToken.perfilesUsuario;
            //console.log("Items",bieSession);
            let { pedido } = req.params;
            if (bieSession != '') {
                const configWs2 = {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'cookie': bieSession || ''
                    }
                };
                const url2 = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/PurchaseOrders(${pedido})`;
                const response2 = yield (0, node_fetch_1.default)(url2, configWs2);
                const data2 = yield response2.json();
                //console.log(data2);
                helpers_1.default.logoutWsSAP(bieSession);
                return res.json(data2);
            }
            return res.json({ error: 501 });
        });
    }
}
const wssapController = new WssapController();
exports.default = wssapController;
