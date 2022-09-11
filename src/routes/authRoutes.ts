import { Router } from "express";

import authController  from "../controllers/authController";

class AuthRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.post('/login', authController.login);
        this.router.post('/recovery', authController.recovery);
        this.router.post('/restore', authController.restore);
        this.router.get('/dependenciesUser', authController.dependenciesUser);
        this.router.get('/dependenciesUserXE', authController.dependenciesUserXE);
        this.router.get('/storesUser', authController.almacenUser);
        this.router.get('/storesUser2', authController.almacenUserXE);
        this.router.get('/areasUser', authController.areasUserXE);
    }
}

const authRoutes = new AuthRoutes();
export default authRoutes.router;