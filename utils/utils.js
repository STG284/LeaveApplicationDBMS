const dateFormat = require('dateformat')
const constants = require('./constants')


function prettyDate(aDate) {
    return dateFormat(aDate, constants.DATE_FRONTEND_FORMAT)
}

function handleGetError(res, error) {
    res.header("Content-Type",'application/json');
    res.status(500)
        .send("ERROR: \n\n" + JSON.stringify(error, null, 4) + "\n\n" + error.stack);
    console.error(error);
}

module.exports = {
    prettyDate: prettyDate,
    handleGetError: handleGetError
}