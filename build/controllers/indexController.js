"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexController = void 0;
class IndexController {
    index(req, res) {
        res.send('Manual API v2.1');
    }
}
exports.indexController = new IndexController();
