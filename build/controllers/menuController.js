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
class MenuController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const menu = yield database_1.db.query(`
       
       SELECT t0.*,t1.title AS 'padre' 
       FROM menu t0
       LEFT JOIN menu t1 ON t0.iddad = t1.id
       ORDER BY t0.ordernum ASC`);
            res.json(menu);
        });
    }
    listFather(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const menu = yield database_1.db.query(`
       
       SELECT t0.*, '' as padre 
       FROM menu t0
       where hierarchy ='P'
       ORDER BY t0.ordernum ASC`);
            res.json(menu);
        });
    }
    orderNum(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { hierarchy, iddad } = req.params;
            let result;
            if (hierarchy == 'P') {
                result = yield database_1.db.query("Select IFNULL(MAX(ordernum),0)+1 as ordernum from menu where hierarchy= ?", [hierarchy]);
            }
            else {
                result = yield database_1.db.query("SELECT IFNULL(MAX(ordernum),0) AS ordernum, (SELECT t0.ordernum FROM menu t0 WHERE t0.id = ?) AS ordernumdad FROM menu WHERE hierarchy= 'H' AND iddad = ? ", [iddad, iddad]);
                let ordernum = iddad + '.';
                if (result[0].ordernum != '0') {
                    let ordernumMax = result[0].ordernum;
                    let arrayOrderNum = ordernumMax.split(".");
                    result[0].ordernum = arrayOrderNum[0] + '.' + (parseInt(arrayOrderNum[1]) + 1);
                }
                else {
                    result[0].ordernum = result[0].ordernumdad + '.' + 1;
                }
            }
            res.json(result);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const newMenu = req.body;
            console.log(newMenu);
            const result = yield database_1.db.query('INSERT INTO menu set ?', [newMenu]);
            res.json(result);
        });
    }
    getMenuById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const { id } = req.params;
            const menu = yield database_1.db.query(`
       
       SELECT t0.*,'' AS 'padre' 
       FROM menu t0
       where t0.id = ?
       ORDER BY t0.ordernum ASC`, [id]);
            res.json(menu);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtener datos del usurio logueado que realizo la petición
            let jwt = req.headers.authorization;
            if (jwt) {
                jwt = jwt.slice('bearer'.length).trim();
                const decodedToken = yield helpers_1.default.validateToken(jwt);
            }
            //******************************************************* */
            const menu = req.body;
            console.log(menu);
            const idMenu = menu.id;
            const newMenu = {
                title: menu.title,
                description: menu.description,
                ordernum: menu.ordernum,
                hierarchy: menu.hierarchy,
                iddad: menu.iddad,
                url: menu.url,
                icon: menu.icon
            };
            const result = yield database_1.db.query('update menu set ? where id = ?', [newMenu, idMenu]);
            res.json(result);
        });
    }
    delete(req, res) {
        res.json({ 'text': 'Delete Games controller ' + req.params.id });
    }
}
const menuController = new MenuController();
exports.default = menuController;
