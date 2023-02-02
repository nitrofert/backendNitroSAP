import nodemailer, { Transporter } from "nodemailer";


class Nitromail {
    

        private hostname = "outlook.office365.com";
        public emailsend= "notificacionapp@nitrofert.com.co";
        private password = "Nitrofert2023*";

        async getTransporter():Promise<Transporter>{
            const  transporter = await nodemailer.createTransport({
                host: this.hostname,
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                  user: this.emailsend,
                  pass: this.password,
                },
                logger: true,
                tls: {
                  //ciphers:'SSLv3',
                  rejectUnauthorized: false,
                  }
              });

              return transporter;
            
        }
      
      
    
}

const nitromail = new Nitromail();
export default nitromail;
