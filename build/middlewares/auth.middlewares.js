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
class VerifyToken {
    validToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jwt = req.headers.authorization;
                // verifica que la cabecera authorization este definida
                if (!jwt) {
                    //Verifica si la ruta tiene permiso para acceder sin token
                    const allowRouteWithoutToken = yield helpers_1.default.validateRoute(req.url);
                    if (!allowRouteWithoutToken) {
                        return res.status(401).json({ message: 'Token invalido ' });
                    }
                }
                else {
                    // valida que el token contenga la sintaxis correcta 
                    // usando el mecanismo de autorización Bearer 
                    if (!jwt.toLowerCase().startsWith('bearer')) {
                        return res.status(401).json({ message: 'Token invalido ' });
                    }
                    else {
                        jwt = jwt.slice('bearer'.length).trim();
                        // valida si el token es correcto o si el tiempo de expiracion caduco
                        const decodedToken = yield helpers_1.default.validateToken(jwt);
                    }
                }
                next();
            }
            catch (error) {
                console.log(error);
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({ message: 'Token expiro ' });
                    return;
                }
                return res.status(500).json({ message: 'Fallo la autenticación del usuario' });
            }
        });
    }
}
const verifyToken = new VerifyToken();
exports.default = verifyToken;
