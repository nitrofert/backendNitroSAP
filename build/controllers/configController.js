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
            try {
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
}
const configController = new ConfigController();
exports.default = configController;
