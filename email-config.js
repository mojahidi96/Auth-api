const nodemailer = require("nodemailer");

module.exports = async function main(sendTo, accessCode) {
    let transporter = await nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.AUTH_EMAIL, //'mojahidi96@gmail.com', // generated ethereal user
            pass: process.env.AUTH_PASS   // 'xxxx' generated ethereal password
        },
    });

    await transporter.sendMail({
        from: 'mojahidi96@gmail.com', // sender address
        to: sendTo, // list of receivers
        subject: "Verification Code", // Subject line
        text: "", // plain text body
        html: `<div>
        Dear User <br>
        <br>
        We received a request to update your password. <br>
        Your verification code is: <br>
        <h1>${accessCode}</h1>          
      </div>`,
    });
}