const logger = require('./Logger');

function sendError (res, err) {
    logger.error(err);
    res.json({ success: false, message: err.message });
}

module.exports = sendError;