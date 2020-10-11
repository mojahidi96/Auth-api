const express = require('express');
const userRoute = express.Router();
const { ReasonPhrases, getStatusCode } = require('http-status-codes');
const { sign } = require('jsonwebtoken');
const { hashSync, compare, compareSync } = require('bcryptjs');


const model = require('./model');
const logger = require('./logger-config');
const { Login, Register, GetUser, Shared } = require('./constant');
const util = require('./util');
const verifyToken = require('./verify-token');
const sendMail = require('./email-config');


userRoute.route('/get').get(verifyToken, (req, res) => {
    logger.info('Entered in get users method');
    model.User.find({}, { password: 0, __v: 0 }, (err, row) => {
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
        req.body.username = req.body.username.toLowerCase();
        req.body.email = req.body.email.toLowerCase();
        model.User.findOne({ email: req.body.email }, (err, getUser) => {
            if (err) throw err;
            if (getUser)
                return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, Register.userExistMessage, {}, res);
            else {
                req.body.password = hashSync(req.body.password, 8);
                let user = new model.User(req.body);
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
    }
})

userRoute.route('/login').post((req, res) => {
    logger.info("Entered to login menthod %s", JSON.stringify(req.body));
    const loginSchema = require('./login-schema');
    req.body.username = req.body.username.toLowerCase();
    const { error } = loginSchema.validate(req.body);
    if (error) {
        logger.error("Error on validation", error);
        return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, `${Shared.validationErrorMessage} ${error.details[0].message}`, error, res);
    } else {
        model.User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
                logger.error("Error occured on ger by username", err);
                return util.createResBodyAndSend(false, ReasonPhrases.INTERNAL_SERVER_ERROR, Shared.errorMessage, err, res);
            } else if (!user) {
                logger.info("No user found", user);
                return util.createResBodyAndSend(false, ReasonPhrases.NOT_FOUND, Login.invalidUserMessage, user, res);
            } else {
                compare(req.body.password, user.password, (invalidPassword, isPasswordMatched) => {
                    if (isPasswordMatched) {
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

userRoute.route('/sendcode').post((req, res) => {
    logger.info('Entered to sendcode endpoint %s', JSON.stringify(req.body));
    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    req.body.email = req.body.email.toLowerCase();
    let access = new model.Access({ verificationCode, creationTime: Date.now(), email: req.body.email });
    model.User.findOne({ email: req.body.email }, (err, user) => {
        if (err) throw err;
        if (!user) {
            return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, Login.invalidUserMessage, user, res)
        }
        else {
            let update = { verificationCode: verificationCode, creationTime: Date.now(), email: req.body.email };
            console.log(update)

            // update = { expire: new Date() },
            let options = { upsert: true, new: true, setDefaultsOnInsert: true };
            model.Access.findOneAndUpdate({ email: req.body.email }, update, options, function (error, result) {//().then(row => {
                console.log(error, result)
                sendMail(req.body.email, verificationCode).then(() => {
                    logger.info("Access code generated and saved %s", result);
                    return util.createResBodyAndSend(true, ReasonPhrases.OK, "Verification code sent to your email", {}, res)
                }).catch((error) => { logger.info("Error occured on sending mail %s", error); });
            }).catch(error => {
                logger.error("Error occured on saving access code %s", error);
                return util.createResBodyAndSend(false, ReasonPhrases.INTERNAL_SERVER_ERROR, Shared.errorMessage, error, res)
            })
        }
    })
})

userRoute.route('/update').put((req, res) => {
    logger.info('Entered to update password');
    req.body.email = req.body.email.toLowerCase();
    model.Access.findOne({ email: req.body.email }, (err, access) => {
        if (err) throw err;
        if (!access)
            return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, Login.invalidUserMessage, access, res);
        else {
            if (access.verificationCode == req.body.verificationCode) {
                req.body.password = hashSync(req.body.password, 8);
                model.User.updateOne({ email: req.body.email }, { $set: { password: req.body.password } }, (error, row) => {
                    if (error) throw error;
                    else {
                        return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, Login.invalidUserMessage, row, res);
                    }
                })
            } else {
                logger.error('Invalid access code');
                return util.createResBodyAndSend(false, ReasonPhrases.BAD_REQUEST, "Invalid access code", {}, res);
            }

        }
    })
})




module.exports = userRoute;