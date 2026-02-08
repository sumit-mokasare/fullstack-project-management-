import Mailgen from "mailgen";
import nodemailer from 'nodemailer'


const sentMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    });

    let emailHtml = mailGenerator.generate(options.mailGenContent);
    let emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: 'mail.taskManager@example.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: emailText, // plain text body
        html: emailHtml, // html bod
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log('Email failed' , error);
    }


}

//  sentMail({
//     email:user.mail,
//     subject: 'aa',
//     mailGenContent:emailVerificationMailgenContent(
//         username,
//         'url'
//     )
//  })

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with our app, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'verify your email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPassowordMailgenContent = (username, resetPassowordUrl) => {
    return {
        body: {
            name: username,
            intro: 'we got a request to reset your Password',
            action: {
                instructions: 'To change your Password  click the button:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'reset Password',
                    link: resetPassowordUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

export {sentMail , emailVerificationMailgenContent , forgotPassowordMailgenContent}