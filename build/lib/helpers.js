"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class Helpers {
    encryptPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hash = yield bcryptjs_1.default.hash(password, salt);
            return hash;
        });
    }
    matchPassword(password, savePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bcryptjs_1.default.compare(password, savePassword);
            }
            catch (error) {
                let now = new Date();
                console.log(error, " ", now);
            }
        });
    }
    generateToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const signInOptions = {
                // RS256 uses a public/private key pair. The API provides the private key
                // to generate the JWT. The client gets a public key to validate the
                // signature
                //algorithm: 'RS256',
                expiresIn: '1h'
            };
            //Configuara secretkey con llave publica y privada generada con openssl
            //temporalmente sera secretkey
            return jsonwebtoken_1.default.sign(payload, 'secreetkey', signInOptions);
        });
    }
    validateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifyOptions = {
                algorithms: ['RS256'],
            };
            return yield (0, jsonwebtoken_1.verify)(token, 'secreetkey');
        });
    }
    validateRoute(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(url);
            const routesAllowWithoutToken = [
                '/api/auth/login',
                '/api/auth/recovery',
                '/api/atuh/restore',
                '/',
                '/api/companies/listActive',
                '/api/permisos/list',
                '/api/wssap/Xengine/items'
            ];
            return routesAllowWithoutToken.includes(url);
        });
    }
    loginWsSAP(infoUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonLog = { "CompanyDB": infoUsuario.dbcompanysap, "UserName": "ABALLESTEROS", "Password": "1234" };
            const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Login`;
            const configWs = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonLog)
            };
            console.log(configWs);
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                const data = yield response.json();
                if (response.ok) {
                    console.log('successfully logged');
                    return response.headers.get('set-cookie');
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
    logoutWsSAP(bieSession) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Logout`;
            const configWs = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `${bieSession}`
                }
            };
            try {
                const response = yield (0, node_fetch_1.default)(url, configWs);
                //const data = await response.json();
                if (response.ok) {
                    return 'ok';
                }
                else {
                    return '';
                }
            }
            catch (error) {
                console.log(error);
                return '';
            }
        });
    }
}
const helper = new Helpers();
exports.default = helper;
