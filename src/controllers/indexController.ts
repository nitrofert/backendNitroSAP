import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';

class IndexController{
    public index(req: Request, res: Response){
        res.send('Manual API v2.1');
    }

    public getAnexo(req: Request, res: Response){
        let {filename } = req.params;

       

        let pathFile = path.resolve('uploads/solped/'+filename);

        
        if(fs.existsSync(pathFile)){
            console.log('exist',pathFile);
            //fs.unlinkSync(pathFile);
            res.download (pathFile);

            /*let road = fs.createReadStream (pathFile); // Crear entrada de flujo de entrada
             res.writeHead(200, {
                 'Content-Type': 'application/force-download',
                 'Content-Disposition': 'attachment; filename=name'
             });
             
             road.pipe (res);*/

        }

    }
}

export const indexController = new IndexController();