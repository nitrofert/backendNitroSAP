import mysql, { Connection } from 'promise-mysql';
import mysql2 from 'promise-mysql2';
import keys from './keys'
const db = mysql.createPool(keys.database);


 db.getConnection()
    .then(connection => {
        db.releaseConnection(connection);
        console.log('DB is Connected');
    });





export  { db } ; 
