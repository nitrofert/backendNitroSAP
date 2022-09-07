import { Request, Response, NextFunction } from 'express';
import helper from "../lib/helpers";

class VerifyToken {

    async validToken(req: Request, res: Response, next: NextFunction) {
        try {
            let jwt = req.headers.authorization;
            
            // verifica que la cabecera authorization este definida
            if (!jwt) {
                //Verifica si la ruta tiene permiso para acceder sin token
                const allowRouteWithoutToken = await helper.validateRoute(req.url);
                if(!allowRouteWithoutToken){
                    return res.status(401).json({ message: 'Token invalido ' });
                }
                
            }else{
                // valida que el token contenga la sintaxis correcta 
                // usando el mecanismo de autorización Bearer 
                if (!jwt.toLowerCase().startsWith('bearer')) {
                    return res.status(401).json({ message: 'Token invalido ' });
                }else{
                    jwt = jwt.slice('bearer'.length).trim();

                    // valida si el token es correcto o si el tiempo de expiracion caduco
                    const decodedToken = await helper.validateToken(jwt);
                }
            }

            
            next();
        } catch (error: any) {
            console.log(error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expiro ' });
                return;
            }

            return res.status(500).json({ message: 'Fallo la autenticación del usuario' });
        }
    }
}

const verifyToken = new VerifyToken();
export default verifyToken;

