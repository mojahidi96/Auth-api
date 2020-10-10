const Joi = require('Joi');
const loginSchema = Joi.object().keys({
    username: Joi.string().required().messages({
        'string.required': 'Username is required',
        'string.empty': 'Username cannot be empty'
    }),
    password: Joi.string().required()
    .messages({
        'string.required': 'Password is required',
        'string.empty': 'Password cannot be empty'
    })
})


module.exports = loginSchema