import express, { Application } from 'express';
import morgan  from 'morgan';
import cors from 'cors';

import indexRoutes from './routes/indexRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

import verifyToken from "./middlewares/auth.middlewares";
import companyRoutes from './routes/companyRoutes';
import configRoutes from './routes/configRoutes';
import menuRoutes from './routes/menuRoutes';
import perfilRoutes from './routes/perfilesRoutes';
import permisoRoutes from './routes/permisoRoutes';
import solpedRoutes from './routes/solpedRoutes';
import wssapRoutes from './routes/wssapRoutes';
import sharedFunctionsRoutes from './routes/sharedFunctionsRoutes';


class Server{

    public app: Application
    constructor(){
       this.app = express();
       this.config();
       this.midelwares();
       this.routes();
    }

    config():void{
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({'extended':false}));
    }

    midelwares(){
        this.app.use(verifyToken.validToken);
    }

    routes():void{
        this.app.use(indexRoutes);
        this.app.use('/api/auth',authRoutes);
        this.app.use('/api/usuarios',userRoutes);
        this.app.use('/api/companies',companyRoutes);
        this.app.use('/api/config/',configRoutes);
        this.app.use('/api/menu/',menuRoutes);
        this.app.use('/api/perfiles/',perfilRoutes);
        this.app.use('/api/permisos/',permisoRoutes);
        this.app.use('/api/compras/solped',solpedRoutes);
        this.app.use('/api/wssap',wssapRoutes);
        this.app.use('/api/shared/functions',sharedFunctionsRoutes);
        
        
    }

    start():void{
        this.app.listen(this.app.get('port'),()=>{
            console.log("Server run on port ",this.app.get('port'));
        });
    }
}

const server = new Server();
server.start();

function perfilesRoutes(arg0: string, perfilesRoutes: any) {
    throw new Error('Function not implemented.');
}
