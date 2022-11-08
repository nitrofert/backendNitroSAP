"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class IndexController {
    index(req, res) {
        res.send('Manual API v2.1');
    }
    getAnexo(req, res) {
        let { filename } = req.params;
        let pathFile = path_1.default.resolve('uploads/solped/' + filename);
        if (fs_1.default.existsSync(pathFile)) {
            console.log('exist', pathFile);
            //fs.unlinkSync(pathFile);
            res.download(pathFile);
            /*let road = fs.createReadStream (pathFile); // Crear entrada de flujo de entrada
             res.writeHead(200, {
                 'Content-Type': 'application/force-download',
                 'Content-Disposition': 'attachment; filename=name'
             });
             
             road.pipe (res);*/
        }
    }
}
exports.indexController = new IndexController();
