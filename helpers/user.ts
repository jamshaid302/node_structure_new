import config from "../config/config";
import jwt from 'jsonwebtoken';
import User from '../database/models/user'

export default class UserHelper {
    static updateToken = async (user_id) => {
        const sessionUserData = await UserHelper.getUserData(user_id);
        if(sessionUserData){
            return {
                data: sessionUserData, token: jwt.sign({user_id: sessionUserData._id}, config.secret,{
                    expiresIn: config.tokenLife,
                })
            }
        }
        return null;
    }

    static getUserData = async (user_id): Promise<any> => {
        const user = await User.findOne({_id: user_id});
        if(user) {
            return user.toObject();
        }
        return null;
    }
}