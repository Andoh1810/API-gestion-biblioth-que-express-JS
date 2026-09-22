import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_HOST_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.MOT_DE_PASSE_APPLICATION
    }
})

const emailService = {
    notification: async (userMail,subject,text) => {
        try {
            const mailOPtion = {
                from: process.env.EMAIL_USER,
                to: userMail,
                subject: subject,
                text: text
            }

            const info = await transporter.sendMail(mailOPtion)
            console.log(`Mail envoyé avec succès à ${userMail}`)
            return info
            
        } catch (error) {
            console.log("Echec lors de l'envoie:",error); 
        }
    },
    envoieQrcode : async (userMail,subject,text,html,qrBuffer) => {
        try {
            const mailOPtion = {
                from: process.env.EMAIL_USER,
                to: userMail,
                subject: subject,
                text: text,
                html: html,
                attachments: [
                    {
                        filename: "qrcode.png",
                        content: qrBuffer,
                        cid: "qrcode"
                    }
                ]
            }

            const info = await transporter.sendMail(mailOPtion)
            console.log(`Mail envoyé avec succès à ${userMail}`)
            return info
            
        } catch (error) {
            console.log("Echec lors de l'envoie:",error); 
        }
    }
}

export default emailService