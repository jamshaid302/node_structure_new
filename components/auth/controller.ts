import { Request, Response } from '../../__types';
import { BaseController } from '../../core';
import Email from "../../helpers/email"
import User from '../../database/models/user';
import UserHelper from '../../helpers/user';
import UserImage from '../../database/models/image';
import Utility from "../../helpers/utility";

export class AuthController extends BaseController {
    public __component: string = "auth";
    public register = async (req: Request, res: Response): Promise<Response> => {
        try{
            const ValidationRules = {
                name: global['config'].commonRules.name,
                email: global['config'].commonRules.email,
            }
            const formErrors =  await this.validateForm(req.body, ValidationRules);
            const FormBody = this.getFormFields(req.body, ValidationRules);
            if(!formErrors){
                const user = await User.findOne({
                    email: FormBody.email
                })
                if(user){
                    return this.json(res, 403, { error: true, success: false, message: this.errors.exist });
                } else {
                    let passwordBeforeEnc = Math.random().toString(36).slice(-8);
                    await Email.sendEmail(passwordBeforeEnc, FormBody.email);
                    const {password,salt} = this.passwordEn(passwordBeforeEnc);
                    FormBody.password = password;
                    FormBody.salt = salt;
                    const createdUser = await User.create(FormBody);
                    if(createdUser){
                        return this.json(res,201,{
                            error: false,
                            success: true,
                            message: "Registration successful.",
                            FormBody
                        })
                    }
                    return res.status(400).json({ error: true, success: false, message: this.errors.signup });
                }
            }
            return res.status(403).json({ error: true, success: false, message: this.errors.invalid });
        }catch (error) {
            return this.exception(req, res, error, 'auth', 'register');
        }
    }

    public login = async (req: Request, res: Response): Promise<Response> => {
        try{
            const ValidationRules = {
                email: global['config'].commonRules.email,
                password: global['config'].commonRules.password,
            }
            const formErrors =  await this.validateForm(req.body, ValidationRules);
            const FormBody = this.getFormFields(req.body, ValidationRules);
            if(!formErrors){
                const checkEmail = await User.findOne({
                    email: FormBody.email
                })
                if(checkEmail){
                    const {password} = this.passwordEn(FormBody.password, checkEmail.salt);
                    if(password == checkEmail.password){
                        const token = await UserHelper.updateToken(checkEmail._id);
                        return this.json(res, 200, {
                            success: true,
                            message: 'Login successful.',
                            token
                        });
                    }
                }
                return res.status(404).json({ error: true, success: false, message: 'Login Information is wrong' });
            }
            return res.status(403).json({ error: true, success: false, message: this.errors.invalid });
        }catch (error) {
            return this.exception(req, res, error, 'auth', 'login');
        }
    }

    public deleteImage = async (req: Request, res: Response): Promise<Response> => {
        try{
            const id = req.params.id;
            const deleteUser = await User.findByIdAndDelete({_id : id})
            if(deleteUser){
                const userImages = await UserImage.findOneAndDelete({userId : deleteUser._id})
                if(userImages){
                    await Promise.all(userImages.images.map( async (image) => {
                        const file = await Utility.deleteFile(image);
                        return file;
                    }));
                    return res.status(404).json({ error: false, success: true, message: 'Images Delete Successfully' });
                }
                return res.status(404).json({ error: true, success: false, message: 'No Image Found' });
            }
            return res.status(404).json({ error: true, success: false, message: 'User Not Found' });
        }catch (error) {
            return this.exception(req, res, error, 'auth', 'delete user images');
        }
    }
}