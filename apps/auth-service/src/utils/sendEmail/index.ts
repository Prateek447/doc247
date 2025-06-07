import nodemailer from "nodemailer";
import dotEnv from "dotenv";
import path from "path";
import ejs from "ejs";

dotEnv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com", 
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
        user: process.env.SMTP_USER ,
        pass: process.env.SMTP_PASSWORD
    }
})

//render ejs email template
const renderEmailTemplate = async (template: string, data: Record<string, any>) : Promise<string> => {
    const templatePath =  path.join(process.cwd(), "auth-service", "src", "utils", "email-template", `${template}.ejs`);

    return ejs.renderFile(templatePath,data);
}

//send an email using nodemailer
export const sendEmail = async (to: string, subject: string, template: string, data: Record<string, any>) : Promise<boolean> => {
    try {
        const html = await renderEmailTemplate(template, data);
        
        const mailOptions = {
            from: `<${process.env.SMTP_USER}>`, // sender address
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
        return false;
    }
}