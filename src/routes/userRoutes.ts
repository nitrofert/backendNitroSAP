
import { Router } from "express";

import userController from "../controllers/userController";


class UserRoutes{
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/list',userController.list);
        this.router.get('/areas-usuario',userController.getAreasByUserSAP );
        this.router.get('/:id',userController.getUserById );
        this.router.get('/companies/:id',userController.getCompaniesUserById );
        this.router.get('/perfiles/:id',userController.getPerfilesUserById );
        
        this.router.post('/companies',userController.setCompaniesUser );
        this.router.post('/perfiles',userController.setPerfilUser );
        
        this.router.post('/',userController.create);
        this.router.put('/',userController.update);
        this.router.post('/adicionar-areas',userController.adicionarAreasUser );
        this.router.post('/eliminar-areas',userController.elimnarAreasUsuario );
        this.router.post('/adicionar-dependencias',userController.adicionarDependenciasUser );
        this.router.post('/eliminar-dependencias',userController.eliminarDependenciasUser );
        this.router.post('/adicionar-almacen',userController.adicionarAlmacenUser );
        this.router.post('/eliminar-almacen',userController.elimnarAlmacenUsuario );
        
        
       
    }
}

const userRoutes = new UserRoutes(); 
export default userRoutes.router;  