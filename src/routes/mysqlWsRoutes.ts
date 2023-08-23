import { Router } from "express";
import mysqlWsQueriesController from "../controllers/mysqlWsController";
import multer from '../lib/multer';

class MySQLWsRoutes{
    public router: Router = Router();

    

    constructor(){
        this.config();
    }

     

    config():void{
        
        this.router.get('/clientes', mysqlWsQueriesController.clientes);
        
    }
}

const mysqlWsRoutes = new MySQLWsRoutes();
export default mysqlWsRoutes.router;