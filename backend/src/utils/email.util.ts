import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import "dotenv/config";

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "sandbox4b0a7ef952214e0695e90009115cbc42.mailgun.org";
const MAILGUN_FROM = process.env.MAILGUN_FROM || `TPCMS <postmaster@${MAILGUN_DOMAIN}>`;

const EMAIL_CONTENT: Record<"reset" | "verify", {
    subject: string;
    text: (url: string) => string;
    html: (url: string) => string;
}> = {
    reset: {
        subject: "Reset your TPCMS password",
        text: (url) => `We received a request to reset your TPCMS password. Open this link to choose a new password (valid for 15 minutes):\n${url}\n\nIf you didn't request this, you can ignore this email.`,
        html: (url) => `<p>We received a request to reset your TPCMS password.</p><p><a href="${url}">Click here to reset your password</a> (valid for 15 minutes).</p><p>If you didn't request this, you can ignore this email.</p>`,
    },
    verify: {
        subject: "Verify your TPCMS email",
        text: (url) => `Verify your TPCMS account by opening this link (valid for 15 minutes):\n${url}`,
        html: (url) => `<p>Verify your TPCMS account:</p><p><a href="${url}">Click here to verify your email</a> (valid for 15 minutes).</p>`,
    },
};

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
    const content = EMAIL_CONTENT[type];
    try {
        const data = await mg.messages.create(MAILGUN_DOMAIN, {
            from: MAILGUN_FROM,
            to: [`User <${toEmail}>`],
            subject: content.subject,
            text: content.text(actionUrl),
            html: content.html(actionUrl),
        });

        console.log(data); // logs response data
    } catch (error) {
        console.log(error); //logs any error
    }
}
