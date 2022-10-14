import mysql, { Connection } from 'promise-mysql';
import mysql2 from 'promise-mysql2';
import keys from './keys'
const db = mysql.createPool(keys.database.dev);


 db.getConnection()
    .then(connection => {
        db.releaseConnection(connection);
        console.log('DB is Connected to ',keys.database.dev.host); 
    });

export  { db } ;  
