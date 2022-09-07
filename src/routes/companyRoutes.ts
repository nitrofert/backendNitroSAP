import { Router } from "express";

import companyController  from "../controllers/companyController";

class AuthRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list', companyController.list);
        this.router.get('/listActive', companyController.listActive);
        this.router.post('/', companyController.create);
        this.router.get('/:id',companyController.getCompanyById); 
        this.router.put('/', companyController.update);
    }
}

const authRoutes = new AuthRoutes();
export default authRoutes.router;