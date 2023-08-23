import express, { Application } from 'express';
import morgan  from 'morgan';
import cors from 'cors';
import path from 'path'
import https from 'https';
import fs from 'fs';

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
import entradaRoutes from './routes/entradaRoutes';
import authRoutesLQ from './routes/authRoutesLQ';
import mrpRoutes from './routes/mrpRoutes';
import reportesRoutes from './routes/reportesRoutes';
import mysqlRoutes from './routes/mysqlRoutes';
import mysqlWsRoutes from './routes/mysqlWsRoutes';


class Server{

    public app: Application
    constructor(){
       this.app = express();
       this.config();
       this.midelwares();
       this.routes();
    }

    config():void{
        
        this.app.set('port', process.env.PORT || 3001);
        this.app.use(morgan('dev'));
        this.app.use(cors({ 
            origin:['http://portal2.nitrofert.com.co','https://portal2.nitrofert.com.co','http://portal.nitrofert.com.co','http://portal.dev.nitrofert.com.co','http://localhost:4200','http://localhost:55280','http://aprobaciones.nitrofert.com.co','https://aprobaciones.nitrofert.com.co'],
            //origin:['*'],
            methods:["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
            allowedHeaders:['Access-Control-Allow-Origin','Content-Type', 'Authorization','withCredentials','enctype'],
            //optionsSuccessStatus:200,
            credentials:true,
            maxAge:3600,
            preflightContinue:true
            }));
        this.app.use(express.json({ limit:'1000mb'}));
        this.app.use(express.urlencoded({limit:'1000mb', 'extended':false}));
        //this.app.use('/uploads', express.static(path.resolve('uploads')));
        this.app.use('/uploads', express.static(path.resolve('uploads')));
        //console.log(path.join(__dirname,'../uploads'));
        //console.log(path.resolve('uploads'));

    }
    
    midelwares(){
        
        this.app.use(verifyToken.validToken);
        //console.log('Midelwares');
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
        this.app.use('/api/compras/mrp',mrpRoutes);
        this.app.use('/api/compras/entrada',entradaRoutes);
        this.app.use('/api/compras/rpt',reportesRoutes);
        this.app.use('/api/wssap',wssapRoutes);
        this.app.use('/api/shared/functions',sharedFunctionsRoutes);
        this.app.use('/api/nitroLQ',authRoutesLQ);
        this.app.use('/api/mysql/query',mysqlRoutes);
        this.app.use('/api/mysql/ws/v1',mysqlWsRoutes);

        
        //console.log('Routes');
        
    }

    start():void{
        
        this.app.listen(this.app.get('port'),()=>{
            console.log("Server run on port ",this.app.get('port'));
        });
        
      /* https.createServer({
            cert: fs.readFileSync('/home/ralbor/conf/web/backend2.nitrofert.com.co/ssl/backend2.nitrofert.com.co.pem'),
            key: fs.readFileSync( '/home/ralbor/conf/web/backend2.nitrofert.com.co/ssl/backend2.nitrofert.com.co.key')
          },this.app).listen(8448, function(){
             console.log('Servidor https correindo en el puerto 8448');
         });*/
         
    }
}

const server = new Server(); 
server.start();

function perfilesRoutes(arg0: string, perfilesRoutes: any) {
    throw new Error('Function not implemented.');
}
