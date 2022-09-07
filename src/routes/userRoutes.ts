
import { Router } from "express";

import userController from "../controllers/userController";


class UserRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list',userController.list);
        this.router.get('/:id',userController.getUserById );
        this.router.get('/companies/:id',userController.getCompaniesUserById );
        this.router.get('/perfiles/:id',userController.getPerfilesUserById );
        this.router.post('/companies',userController.setCompaniesUser );
        this.router.post('/perfiles',userController.setPerfilUser );
        this.router.post('/',userController.create);
        this.router.put('/',userController.update);
       
    }
}

const userRoutes = new UserRoutes(); 
export default userRoutes.router;  