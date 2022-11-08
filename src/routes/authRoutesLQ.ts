import { Router } from "express";

import authLQController  from "../controllers/authLQController";

class AuthLQRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/titulos', authLQController.titulos);
        this.router.get('/titulos/pagos', authLQController.pagos);

    }
}

const authLQRoutes = new AuthLQRoutes();
export default authLQRoutes.router;