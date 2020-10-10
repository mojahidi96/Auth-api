const express = require('express');
const userRoute = express.Router();
const { ReasonPhrases, getStatusCode } = require('http-status-codes');
const { sign } = require('jsonwebtoken');
const { hashSync, compare, compareSync } = require('bcryptjs');
const nodemailer = require("nodemailer");

const User = require('./model');
const logger = require('./logger-config');
const { Login, Register, GetUser, Shared } = require('./constant');
const util = require('./util');
const verifyToken = require('./verify-token');


userRoute.route('/get').get(verifyToken, (req, res) => {
    logger.info('Entered in get users method');
    User.find({}, { password: 0, __v: 0 }, (err, row) => {
        if (err) {
            logger.error('Error on fetching users %s', err);
            return util.createResBodyAndSend(false, ReasonPhrases.NOT_FOUND, GetUser.errorMessage, err, res);
        }
        else {
            logger.info('Users fetched');
            return util.createResBodyAndSend(true, ReasonPhrases.OK, GetUser.successMessage, row, res);
        }
    })
})

userRoute.route('/add').post((req, res) => {
    logger.info("Entered to add user method");
    const userSchema = require('./user-validation');
    const { error } = userSchema.validate(req.body);
    if (error) {
        logger.error("Error on validation %s", error);
        return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, `${Shared.validationErrorMessage} ${error.details[0].message}`, error.details, res);
    } else {
        req.body.password = hashSync(req.body.password, 8);
        let user = new User(req.body);
        user.save().then(row => {
            delete row._doc.password;

            logger.info("User created successfully %s", row);
            return util.createResBodyAndSend(true, ReasonPhrases.CREATED, Register.successMessage, row._doc, res);
        }).catch(err => {
            logger.error("Error on saving user %s", err);
            return util.createResBodyAndSend(false, ReasonPhrases.NOT_FOUND, Shared.errorMessage, err, res);
        })
    }
})

userRoute.route('/login').post((req, res) => {
    logger.info("Entered to login menthod %s", JSON.stringify(req.body));
    const loginSchema = require('./login-schema');
    const { error } = loginSchema.validate(req.body);
    if (error) {
        logger.error("Error on validation", error);
        return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, `${Shared.validationErrorMessage} ${error.details[0].message}`, error, res);
    } else {
        User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
                logger.error("Error occured on ger by username", err);
                return util.createResBodyAndSend(false, ReasonPhrases.INTERNAL_SERVER_ERROR, Shared.errorMessage, err, res);
            } else if (!user) {
                logger.info("No user found", user);
                return util.createResBodyAndSend(false, ReasonPhrases.NOT_FOUND, Login.invalidUserMessage, user, res);
            } else {
                compare(req.body.password, user.password, (invalidPassword, validPassword) => {
                    if (validPassword) {
                        delete user._doc.password;
                        let token = sign(user._doc, 'supersecret', {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        logger.info("User authorized successfully");
                        return util.createResBodyAndSend(true, ReasonPhrases.OK, Login.successMessage, { token }, res);
                    } else {
                        logger.info("Wrong password");
                        return util.createResBodyAndSend(false, ReasonPhrases.UNAUTHORIZED, Login.wrongPassword, user, res);
                    }
                });
            }
        })
    }
})

userRoute.route('/update').put((req, res) => {
// req.body.email;
console.log('hello')
logger.info('Entered to update password');

async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'mojahidi96@gmail.com', // generated ethereal user
        pass: 'Sonu@9304543620', // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'mojahidi96@gmail.com', // sender address
      to: "mojahidi96@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Code 8769</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  
  main().catch(console.error);
})

module.exports = userRoute;