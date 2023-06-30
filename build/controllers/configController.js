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
class ConfigController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Obtener datos del usurio logueado que realizo la petición
                const { id } = req.params;
                console.log(req.params);
                let jwt = req.headers.authorization;
                if (jwt) {
                    jwt = jwt.slice('bearer'.length).trim();
                    const decodedToken = yield helpers_1.default.validateToken(jwt);
                    //console.log(decodedToken);
                }
                //******************************************************* */
                const sql = `SELECT t0.* 
        FROM menu t0 
        INNER JOIN perfil_menu_accions t1 ON t1.id_menu = t0.id 
        WHERE t1.id_perfil IN (SELECT t10.id 
                    FROM perfiles t10 
                    INNER JOIN perfil_users t11 ON t11.id_perfil = t10.id 
                    WHERE t11.id_user = ${id}) AND
             
              t1.read_accion = TRUE
        ORDER BY t0.ordernum ASC`;
                console.log(sql);
                const menu = yield database_1.db.query(sql);
                let menupadres = menu.filter(opcion => opcion.hierarchy == 'P');
                let menuhijos = menu.filter(opcion => opcion.hierarchy == 'H');
                let menuportal = [{
                        label: 'Inicio',
                        items: [
                            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/portal'] }
                        ]
                    }];
                let items;
                for (let opcionMenuPadre of menupadres) {
                    items = [];
                    for (let opcionMenuHijo of menuhijos) {
                        if (opcionMenuPadre.id == opcionMenuHijo.iddad) {
                            items.push({ label: opcionMenuHijo.title, icon: opcionMenuHijo.icon, routerLink: [opcionMenuHijo.url] });
                        }
                    }
                    menuportal.push({
                        label: opcionMenuPadre.title,
                        items: items
                    });
                }
                console.log(menuportal);
                res.json(menuportal);
            }
            catch (error) {
                console.error(error);
                res.json(error);
            }
        });
    }
    loadSeriesSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    //objtype de la solped
                    let objtype = '1470000113';
                    let seriesSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getSeriesXE(company.dbcompanysap, objtype));
                    if (seriesSAP.length > 0) {
                        console.log(seriesSAP);
                        //Register series Mysql
                        yield helpers_1.default.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                    }
                    //objtype de la oc
                    objtype = '22';
                    seriesSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getSeriesXE(company.dbcompanysap, objtype));
                    if (seriesSAP.length > 0) {
                        console.log(seriesSAP);
                        //Register series Mysql
                        yield helpers_1.default.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                    }
                    //objtype de la entrada
                    objtype = '20';
                    seriesSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getSeriesXE(company.dbcompanysap, objtype));
                    if (seriesSAP.length > 0) {
                        console.log(seriesSAP);
                        //Register series Mysql
                        yield helpers_1.default.registrarSeries(seriesSAP, company.urlwsmysql, objtype);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadCuentasContablesSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let cuentasSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getCuentasXE(company.dbcompanysap));
                    if (cuentasSAP.length > 0) {
                        console.log(cuentasSAP);
                        //Register cuentasSAP Mysql
                        yield helpers_1.default.registrarCuentas(cuentasSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadTaxesSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let taxesSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getTaxesXE(company.dbcompanysap));
                    if (taxesSAP.length > 0) {
                        console.log(taxesSAP);
                        //Register taxesSAP Mysql
                        yield helpers_1.default.registrarImpuestos(taxesSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadItemsSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let itemsSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.itemsSolpedXengine(company.dbcompanysap));
                    if (itemsSAP.length > 0) {
                        //console.log(itemsSAP);
                        //Register itemsSAP Mysql
                        yield helpers_1.default.registrarItems(itemsSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadModelosAprobacionSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let modelosSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getModelosAPXE(company.dbcompanysap));
                    console.log(modelosSAP.length);
                    if (modelosSAP.length > 0) {
                        //console.log(modelosSAP);
                        //Register modelosSAP Mysql
                        yield helpers_1.default.registrarModelosAP(modelosSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadProveedoresSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let proveedoresSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getProveedores2XE(company.dbcompanysap));
                    if (proveedoresSAP.length > 0) {
                        //console.log(proveedoresSAP);
                        //Register proveedoresSAP Mysql
                        yield helpers_1.default.registrarProveedores(proveedoresSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadDependenciasSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let dependendciasSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getDependenciasSL(company.dbcompanysap));
                    if (dependendciasSAP.length > 0) {
                        //console.log(dependendciasSAP);
                        //Register dependendciasSAP Mysql
                        yield helpers_1.default.registrarDependencias(dependendciasSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadCuentasDependenciasSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let dependendciasSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getCuentasDependenciasSL(company.dbcompanysap));
                    if (dependendciasSAP.length > 0) {
                        //console.log(dependendciasSAP);
                        //Register dependendciasSAP Mysql
                        yield helpers_1.default.registrarCuentasDependencias(dependendciasSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadUdoUsuariosSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                let usuarios = yield database_1.db.query(`Select * from users where status='A'`);
                for (let usuario of usuarios) {
                    for (let company of companies) {
                        let areasUsuario = yield helpers_1.default.objectToArray(yield helpers_1.default.getAreasUserXE(company.dbcompanysap, usuario.codusersap));
                        if (areasUsuario.length > 0) {
                            console.log('AREAS', company.dbcompanysap, usuario.codusersap, areasUsuario);
                            //Register cuentasSAP Mysql
                            yield helpers_1.default.registrarAreasUsuario(areasUsuario, company.id, usuario.id);
                        }
                        let storesUsuario = yield helpers_1.default.objectToArray(yield helpers_1.default.getStoresUserXE(company.dbcompanysap, usuario.codusersap));
                        if (storesUsuario.length > 0) {
                            //console.log('ALMACENES',company.dbcompanysap,usuario.codusersap, storesUsuario);
                            //Register cuentasSAP Mysql
                            yield helpers_1.default.registrarStoresUsuario(storesUsuario, company.id, usuario.id);
                        }
                        let dependenciasUsuario = yield helpers_1.default.objectToArray(yield helpers_1.default.getDependenciasUserXE(company.dbcompanysap, usuario.codusersap));
                        if (dependenciasUsuario.length > 0) {
                            //console.log('DEPENDENCIAS',company.dbcompanysap,usuario.codusersap, dependenciasUsuario);
                            //Register cuentasSAP Mysql
                            yield helpers_1.default.registrarDependenciasUsuario(dependenciasUsuario, company.id, usuario.id);
                        }
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadAlmacenesSapToMysql(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A'`);
                for (let company of companies) {
                    let almacenesSAP = yield helpers_1.default.objectToArray(yield helpers_1.default.getAlmacenes(company.dbcompanysap));
                    if (almacenesSAP.length > 0) {
                        //console.log(almacenesSAP);
                        //Register almacenesSAP Mysql
                        yield helpers_1.default.registrarAlmacenes(almacenesSAP, company.urlwsmysql);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadTasasDeCambio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaTrm } = req.params;
            try {
                let companies = yield database_1.db.query(`Select * from companies where status='A' and dbcompanysap='PRUEBAS_NITROFERT_PRD'`);
                for (let company of companies) {
                    let trmDia = yield helpers_1.default.objectToArray(yield helpers_1.default.getTrmDiaXE(company.dbcompanysap, fechaTrm));
                    if (trmDia.length > 0) {
                        console.log(trmDia);
                        //Register dependendciasSAP Mysql
                        yield helpers_1.default.registrarTrmDia(trmDia, fechaTrm);
                    }
                }
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadRecetasItemPT(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recetas_item_pt = yield helpers_1.default.objectToArray(yield helpers_1.default.getItemsMPbyItemPT('NITROFERT_PRD', ''));
                console.log(recetas_item_pt);
                const result = yield helpers_1.default.registrarRecetasItemPT(recetas_item_pt, 'nitrosap');
                console.log(result);
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadListaPreciosSAPPT(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lista_precios_sap_pt = yield helpers_1.default.objectToArray(yield helpers_1.default.getListaPreciosItemSAP('NITROFERT_PRD', ''));
                console.log(lista_precios_sap_pt);
                const result = yield helpers_1.default.registrarListaPreciosSAPPT(lista_precios_sap_pt, 'nitrosap');
                console.log(result);
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
    loadListaPrecioVentasSAP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fechaFin = new Date();
                let fechaInicio = yield helpers_1.default.sumarDias(fechaFin, -14);
                const lista_precios_venta = yield helpers_1.default.objectToArray(yield helpers_1.default.getPrecioVentaItemSAP2('NITROFERT_PRD', '', fechaInicio.toISOString(), fechaFin.toISOString()));
                console.log(lista_precios_venta);
                const result = yield helpers_1.default.registrarListaPrecioVentaSAP(lista_precios_venta, 'nitrosap');
                console.log(result);
                res.json({ ok: 'ok' });
            }
            catch (error) {
                console.error(error);
                return res.json(error);
            }
        });
    }
}
const configController = new ConfigController();
exports.default = configController;
