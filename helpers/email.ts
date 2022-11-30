import config from "../config/config";
const sgMail = require('@sendgrid/mail');

export default class Email {
    public static async sendEmail (password,email){
        sgMail.setApiKey(config.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: 'jamshaidniazi000@gmail.com',
            subject: 'Password',
            text: 'Your Password is: ' + password,
            html: '<strong>Your Password is: </strong>' + password,
        };
        if (config.sendEmails) {
            await sgMail.send(msg);
            return { success: true };
        }
        return { success: false };
    }
}