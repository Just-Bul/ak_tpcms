import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export const sendEmail = async (
    type: "reset" | "verify", 
    toEmail: string, 
    actionUrl: string
) => {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY || "API_KEY",
        // When you have an EU-domain, you must specify the endpoint:
        // url: "https://api.eu.mailgun.net"
    });
    try {
        const data = await mg.messages.create("sandbox4b0a7ef952214e0695e90009115cbc42.mailgun.org", {
        from: "Mailgun Sandbox <postmaster@sandbox4b0a7ef952214e0695e90009115cbc42.mailgun.org>",
        to: [`User <${toEmail}>`],
        subject: "Hi there!",
        text: `Here is your password reset <a href="${actionUrl}">link<a>`,
        });

        console.log(data); // logs response data
    } catch (error) {
        console.log(error); //logs any error
    }
}