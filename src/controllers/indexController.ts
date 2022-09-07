import { Request, Response } from "express";

class IndexController{
    public index(req: Request, res: Response){
        res.send('Manual API');
    }
}

export const indexController = new IndexController();