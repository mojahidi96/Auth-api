const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

const User = new Schema({
    id: { type: Number },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String },
    password: { type: String },
    profileImg: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipcode: { type: Number }
    }
})

const Access = new Schema({
    email: { type: String },
    verificationCode: { type: String },
    creationTime: { type: Date }
})

module.exports = { User: mongoose.model('User', User), Access: mongoose.model('Access', Access) };

