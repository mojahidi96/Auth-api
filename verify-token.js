const { verify } = require('jsonwebtoken');
const util = require('./util');
const { ReasonPhrases } = require('http-status-codes');
const { Login } = require('./constant');

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token)
        return util.createResBodyAndSend(false, ReasonPhrases.FORBIDDEN, Login.noTokenMessage, token, res);
    verify(token, 'supersecret', function (err, decoded) {
        if (err)
            util.createResBodyAndSend(false, ReasonPhrases.INTERNAL_SERVER_ERROR, Login.invalidTokenMessage, err, res);
        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;