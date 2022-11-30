import { Request, Response } from '../../__types';
import { BaseController } from '../../core';
import UserImage from '../../database/models/image';
import Utility from '../../helpers/utility';
const mongoose = require('mongoose');

export class ImageController extends BaseController {
    public __component: string = 'image';

    public uploadUserImage = async (req: Request, res: Response): Promise<Response> => {
        try{
            let images : string[] = [];
            // console.log(global['user']._id);
            // const existingImages = await UserImage.find({_id: global['user']._id});
            const ValidationRules = {
                caption: global['config'].commonRules.imageCaption,
            };
            // const Validate = new Validator(req.body, ValidationRules);
            const formErrors =  await this.validateForm(req.body, ValidationRules);
            const FormBody = this.getFormFields(req.body, ValidationRules);
            if(!formErrors){
                //when existing user images will come
                const existingUser = await UserImage.findOne({userId: mongoose.Types.ObjectId(req.user._id)});
                if(existingUser){
                    const files = await Promise.all(req.files.images.map( async (image) => {
                        const file = await Utility.uploadFile(image,'userImages/');
                        return file;
                    }));

                    files.map( async file =>{
                        let host: any = `http://${req.headers.host}${file}`;
                        images = existingUser.images;
                        images.push(host);
                    })
                    FormBody.images = [...images];
                    FormBody.userId = global['user']._id;

                    const update = await UserImage.updateOne({_id : existingUser._id},{images : FormBody.images});
                    if(update){
                        return this.json(res, 200, {
                            error: false,
                            success: true,
                            message: "User Images Update",
                            update
                        });
                    }
                }

                //when new user images will come
                const files = await Promise.all(req.files.images.map( async (image) => {
                    const file = await Utility.uploadFile(image,'userImages/');
                    return file;
                }));

                files.map( async file =>{
                    images.push(`http://${req.headers.host}${file}`);
                })
                FormBody.images = [...images];
                FormBody.userId = global['user']._id;
                const result = await UserImage.create(FormBody);
                if(result){
                    return this.json(res, 201, {
                        error: false,
                        success: true,
                        message: "User Images Saved",
                        result
                    });
                }
                return this.json(res, 400, {
                    error: true,
                    success: false,
                    message: "User Images Not Saved",
                });
            } else {
                return res.status(400).json({ error: true, success: false, message: 'Caption Needed' });
            }
        }catch (error) {
            return this.exception(req, res, error, 'auth', 'image');
        }
    }

    public deleteUserImage =  async (req: Request, res: Response): Promise<Response> =>{
        try{
            const id = global['user']._id;
            if(id && req.body.image){
                await UserImage.findOneAndUpdate(
                    {userId: id},
                    {$pull: {'images': req.body.image}}
                    )
                Utility.deleteFile(req.body.image);
                return this.json(res, 400, {
                    error: false,
                    success: true,
                    message: "Image Delete Successfully",
                });
            }
            return res.status(400).json({ error: true, success: false, message: 'User id required' });
        }catch (error) {
            return this.exception(req, res, error, 'auth', 'delete user images');
        }
    }
}