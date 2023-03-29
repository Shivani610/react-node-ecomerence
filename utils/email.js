const nodemailer = require("nodemailer")
exports.sendEmail = ({ sendTo, sub, msg, htmlMsg }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "pratikshakurkure850@gmail.com",
            pass: "edotfibzujhqataq"
        }
    })
    transporter.sendMail({
        to: sendTo,
        // to: "aratiwadgaonkar1999@gmail.com",
        from: "pratikshakurkure850@gmail.com",
        subject: sub,
        html: htmlMsg,
        text: msg
    }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("email send successfully");
        }
    })
}