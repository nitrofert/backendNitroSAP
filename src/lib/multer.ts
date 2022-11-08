import multer from 'multer'
import path from 'path'
//import uuid from 'uuid/v4';

// Settings
const storage = multer.diskStorage({
    destination: 'uploads/solped',
    filename: (req, file, cb) => { 
        //console.log(file);
        let fileName= Date.now();
        cb(null, fileName + path.extname(file.originalname))
    }
});
export default multer({storage});  