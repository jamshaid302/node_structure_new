import fs from 'fs';
import moment from "moment";
const Validator = require('validatorjs');

export default class Utility{
    public static dir = async (path): Promise<string> => {
        const dest = global['appRoot'] + global['config'].uploads.path + path;
        if(fs.existsSync(path)){
            return dest;
        }
        await fs.mkdirSync(dest, { recursive: true})
        return dest;
    }

    public static async uploadFile(file, path, extraVar = '') {
        if (file) {
            const originalFileName = file.originalname.split(".");
            const ext = originalFileName[originalFileName.length - 1];
            const dest = await Utility.dir(path);
            const fileName = (extraVar ? extraVar + '_' : '') + Utility.randomString(10) + moment().format("x") + '.' + ext;
            fs.renameSync(file.path, dest + fileName);
            return global['config'].uploads.path + path + fileName;
        }
    }

    public static deleteFile(path) {
        const splitPath = path.split('/');
        splitPath.splice(0,4);
        const joinPath = splitPath.join('/');
        const fullpath = global['appRoot'] + global['config'].uploads.path + '/' + joinPath;
        fs.unlinkSync(fullpath);
    }

    public static deleteFiles (path) {
        path.forEach( el => {
            const fullPath = el;
            console.log(fullPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        })
    }

    public static uploadBase64File = (base64Image, dir, extraVar = '') => {
        let filePath;
        if(base64Image) {
            const originalFileName = base64Image.originalname.split(".");
            const ext = originalFileName[originalFileName.length - 1];
            const dest = Utility.dir(dir);
            const fileName = (extraVar ? extraVar + '_' : '') + Utility.randomString(10) + moment().format("x") + '.' + ext;
            filePath = global['config'].uploads.path + dir + fileName;
            fs.writeFileSync(dest + fileName, base64Image, { encoding: 'base64' });
        }
        return filePath;
    }

    public static randomString = (length, noOnly = false) => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        if (noOnly) {
            characters = '0123456789';
        }
        const charactersLength = characters.length;
        for (let i=0; i < length ; i++){
            result += characters.charAt(Math.floor(Math.random()) * charactersLength )
        }
        return result;
    }

    public validateForm = async (FormBody, ValidationRules): Promise<boolean|object> => {
        const validator = new Validator(FormBody, ValidationRules);
        return new Promise((resolve,reject) => {
            function passes(){
                resolve(false)
            }
            function fails() {
                resolve(validator.errors.all())
            }
            validator.checkAsync(passes, fails)
        })
    }

    public getFormFields = (FormBody: Object, ValidationRules: Object) : any => {
        const res = {};
        Object.keys(ValidationRules).forEach(key => {
            res[key] = FormBody[key];
        });
        return res;
    }
}