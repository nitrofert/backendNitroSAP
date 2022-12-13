"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const indexRoutes_1 = __importDefault(require("./routes/indexRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const auth_middlewares_1 = __importDefault(require("./middlewares/auth.middlewares"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const configRoutes_1 = __importDefault(require("./routes/configRoutes"));
const menuRoutes_1 = __importDefault(require("./routes/menuRoutes"));
const perfilesRoutes_1 = __importDefault(require("./routes/perfilesRoutes"));
const permisoRoutes_1 = __importDefault(require("./routes/permisoRoutes"));
const solpedRoutes_1 = __importDefault(require("./routes/solpedRoutes"));
const wssapRoutes_1 = __importDefault(require("./routes/wssapRoutes"));
const sharedFunctionsRoutes_1 = __importDefault(require("./routes/sharedFunctionsRoutes"));
const entradaRoutes_1 = __importDefault(require("./routes/entradaRoutes"));
const authRoutesLQ_1 = __importDefault(require("./routes/authRoutesLQ"));
const mrpRoutes_1 = __importDefault(require("./routes/mrpRoutes"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.midelwares();
        this.routes();
    }
    config() {
        this.app.set('port', process.env.PORT || 3001);
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use((0, cors_1.default)({
            origin: ['http://portal.nitrofert.com.co', 'http://portal.dev.nitrofert.com.co', 'http://localhost:4200'],
            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
            allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type', 'Authorization', 'withCredentials', 'enctype'],
            //optionsSuccessStatus:200,
            credentials: true,
            maxAge: 3600,
            preflightContinue: true
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ 'extended': false }));
        //this.app.use('/uploads', express.static(path.resolve('uploads')));
        this.app.use('/uploads', express_1.default.static(path_1.default.resolve('uploads')));
        //console.log(path.join(__dirname,'../uploads'));
        //console.log(path.resolve('uploads'));
    }
    midelwares() {
        this.app.use(auth_middlewares_1.default.validToken);
        //console.log('Midelwares');
    }
    routes() {
        this.app.use(indexRoutes_1.default);
        this.app.use('/api/auth', authRoutes_1.default);
        this.app.use('/api/usuarios', userRoutes_1.default);
        this.app.use('/api/companies', companyRoutes_1.default);
        this.app.use('/api/config/', configRoutes_1.default);
        this.app.use('/api/menu/', menuRoutes_1.default);
        this.app.use('/api/perfiles/', perfilesRoutes_1.default);
        this.app.use('/api/permisos/', permisoRoutes_1.default);
        this.app.use('/api/compras/solped', solpedRoutes_1.default);
        this.app.use('/api/compras/mrp', mrpRoutes_1.default);
        this.app.use('/api/compras/entrada', entradaRoutes_1.default);
        this.app.use('/api/wssap', wssapRoutes_1.default);
        this.app.use('/api/shared/functions', sharedFunctionsRoutes_1.default);
        this.app.use('/api/nitroLQ', authRoutesLQ_1.default);
        //console.log('Routes');
    }
    start() {
        this.app.listen(this.app.get('port'), () => {
            console.log("Server run on port ", this.app.get('port'));
        });
    }
}
const server = new Server();
server.start();
function perfilesRoutes(arg0, perfilesRoutes) {
    throw new Error('Function not implemented.');
}
