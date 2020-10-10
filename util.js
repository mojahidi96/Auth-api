const util = {};
const { getStatusCode } = require('http-status-codes');

util.createResBodyAndSend = function (success, reasonPhrases, message, data, res) {
    return res.status(getStatusCode(reasonPhrases)).json({ success, reasonPhrases, message, data });
}

module.exports = util;