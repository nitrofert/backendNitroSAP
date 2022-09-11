import bcrypt  from 'bcryptjs';
import jwt, { SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { InfoUsuario } from '../interfaces/decodedToken.interface';
import fetch from 'node-fetch';

class Helpers {

    async encryptPassword (password:string):Promise<string>{
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    }

    async matchPassword (password:string,savePassword:string){
        try {
          return  await bcrypt.compare(password,savePassword);
        } catch (error) {
            let now= new Date();
            console.log(error," ",now);
        }
    }

    async generateToken(payload:any):Promise<string>{

        const signInOptions: SignOptions = {
            // RS256 uses a public/private key pair. The API provides the private key
            // to generate the JWT. The client gets a public key to validate the
            // signature
            //algorithm: 'RS256',
            expiresIn: '1h'
        };

        //Configuara secretkey con llave publica y privada generada con openssl
        //temporalmente sera secretkey

        return  jwt.sign(payload,'secreetkey',signInOptions);
         
    }

    async validateToken(token:string):Promise<any>{

        const verifyOptions: VerifyOptions = {
            algorithms: ['RS256'],
        };

        return await verify(token, 'secreetkey');

    }

    async validateRoute(url:string):Promise<any>{
        console.log(url);
        const routesAllowWithoutToken:string[] = [
            '/api/auth/login',
            '/api/auth/recovery',
            '/api/atuh/restore',
            '/',
            '/api/companies/listActive',
            '/api/permisos/list',
            '/api/wssap/Xengine/items'
        ];

        return routesAllowWithoutToken.includes(url);
    }

    async loginWsSAP(infoUsuario:InfoUsuario):Promise<any>{

        const jsonLog = {"CompanyDB":infoUsuario.dbcompanysap,"UserName":"ABALLESTEROS","Password":"1234"};
        const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Login`;
        
        const configWs = {
            method:"POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonLog)
        }

        console.log(configWs);
        try{

            const response = await fetch(url, configWs);
            const data = await response.json();

            if(response.ok){
                console.log('successfully logged');
                return  response.headers.get('set-cookie');
            }else{

                return  '';

            }
        } catch (error) {
            console.log(error);
            return  '';
        } 
 
        

    }

    async logoutWsSAP(bieSession:string):Promise<any>{

        
        const url = `https://nitrofert-hbt.heinsohncloud.com.co:50000/b1s/v1/Logout`;
        
        const configWs = {
            method:"POST", 
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${bieSession}`
            }
        }

        try{

            const response = await fetch(url, configWs);
            //const data = await response.json();
            if(response.ok){
                return  'ok';
            }else{
                return  '';
            }
        } catch (error) {
            console.log(error);
            return  '';
        }
 
        

    }

    async format(strDate:string) {
        const inputDate:Date = new Date(strDate);
        let date, month, year;
      
        date = inputDate.getDate();
        month = inputDate.getMonth() + 1;
        year = inputDate.getFullYear();
      
          date = date
              .toString()
              .padStart(2, '0');
      
          month = month
              .toString()
              .padStart(2, '0');
      
        return `${year}-${month}-${date}`;
      }
    
}
const helper = new Helpers();
export default helper;