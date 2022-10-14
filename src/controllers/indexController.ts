import { Request, Response } from "express";

class IndexController{
    public index(req: Request, res: Response){
        res.send('Manual API v2.1');
    }
}

export const indexController = new IndexController();