import { Router } from "express";

import sharedFunctionsController  from "../controllers/sharedFunctionsController";

class SharedFunctionsRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/taxes/:taxOption?', sharedFunctionsController.taxes);
       
    }
}

const sharedFunctionsRoutes = new SharedFunctionsRoutes();
export default sharedFunctionsRoutes.router;