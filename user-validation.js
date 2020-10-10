const Joi = require('Joi');
const registerSchema = Joi.object().keys({
    firstName: Joi.string().min(3).max(50).alphanum().required()
        .messages({
            'string.base': `First name should be a type of text`,
            'string.empty': `First name cannot be an empty field`,
            'string.min': `First name should have a minimum length of {#limit}`,
            'any.required': `First name cannot be blank`,
            'string.max': "First name should have a maximum length of {#limit}",
            'string.alphanum': "First name should not have symbole"
        }),
    lastName: Joi.string().min(3).max(46).alphanum().required()
        .messages({
            'string.base': `Last name should be a type of text`,
            'string.empty': `Last name cannot be an empty field`,
            'string.min': `Last name should have a minimum length of {#limit}`,
            'any.required': `Last name cannot be blank`,
            'string.max': "Last name should have a maximum length of {#limit}",
            'string.alphanum': "Last name should not have symbole"
        }),
    username: Joi.string().min(4).max(62).required()
        .messages({
            'string.base': `Username should be a type of text`,
            'string.empty': `Username cannot be an empty field`,
            'string.min': `Username should have a minimum length of {#limit}`,
            'any.required': `Username cannot be blank`,
            'string.max': "Username should have a maximum length of {#limit}"
        }),
    email: Joi.string().min(4).max(62).email().required()
        .messages({
            'string.base': `Email should be a type of text`,
            'string.empty': `Email cannot be an empty field`,
            'string.min': `Email should have a minimum length of {#limit}`,
            'any.required': `Email cannot be blank`,
            'string.max': "Email should have a maximum length of {#limit}"
        }),
    password: Joi.string().required().pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')).messages({
        'string.empty': 'Password cannot be empty',
        'string.required': 'Password is required',
        'string.min': `Password atleast of {#limit} character length`,
        'string.pattern.base': `Password should be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character`
    }),
    cnfPassword: Joi.string().required().valid(Joi.ref('password')).messages({ 'any.required': `Confirm password is required.`, "any.only": 'Confirm password must match password' }),
    profileImg: Joi.string(),
    address: {
        street: Joi.string().min(4).max(95).required()
            .messages({
                'string.base': `Street should be a type of text`,
                'string.empty': `Street cannot be an empty field`,
                'string.min': `Street should have a minimum length of {#limit}`,
                'any.required': `Street cannot be blank`,
                'string.max': "Street should have a maximum length of {#limit}"
            }),
        city: Joi.string().min(2).max(35).allow('').required()
            .messages({
                'string.base': `City should be a type of text`,
                'string.empty': `City cannot be an empty field`,
                'string.min': `City should have a minimum length of {#limit}`,
                'any.required': `City cannot be blank`,
                'string.max': "City should have a maximum length of {#limit}"
            }),
        state: Joi.string().max(45).required()
            .messages({
                'string.base': `State should be a type of text`,
                'string.empty': `State cannot be an empty field`,
                'any.required': `State cannot be blank`,
                'string.max': "State should have a maximum length of {#limit}"
            }),
        zipcode: Joi.number().min(10000).max(999999).required()
            .messages({
                'string.base': `Zip code should be a type of text`,
                'string.empty': `Zip code cannot be an empty field`,
                'string.min': `Zip code should have a minimum length of {#limit}`,
                'any.required': `Zip code cannot be blank`,
                'string.max': "Zip code should have a maximum length of {#limit}"
            })
    }
});

module.exports = registerSchema;

