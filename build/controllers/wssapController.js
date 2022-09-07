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
    BusinessPartners(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization || '';
            jwt = jwt.slice('bearer'.length).trim();
            const decodedToken = yield helpers_1.default.validateToken(jwt);
            //******************************************************* */
            const infoUsuario = decodedToken.infoUsuario;
            const bieSession = yield helpers_1.default.loginWsSAP(infoUsuario);
            console.log("BusinessPartners ", bieSession);
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
            console.log("Items", bieSession);
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
            console.log("Items", bieSession);
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
    itemsXengine(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const url2 = `http://UBINITROFERT:nFtHOkay345$@vm-hbt-hm33.heinsohncloud.com.co:8000/WSNTF/WSNTF.xsjs`;
            /*http.get(url2,(resp)=>{
                console.log(resp);
            });*/
            const response2 = yield (0, node_fetch_1.default)(url2);
            //console.log(response2.body); 
            const data2 = yield response2.json();
            //console.log(data2);
            return res.json(data2);
        });
    }
}
const wssapController = new WssapController();
exports.default = wssapController;
