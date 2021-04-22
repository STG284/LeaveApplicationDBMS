const dateFormat = require('dateformat')
const constants = require('./constants')


function prettyDate(aDate, showTime=false) {
    if(showTime)
        return dateFormat(aDate, constants.DATE_TIME_FRONTEND_FORMAT)
    else
        return dateFormat(aDate, constants.DATE_FRONTEND_FORMAT)
}

function handleGetError(res, error) {
    res.header("Content-Type",'application/json');
    res.status(500)
        .send("ERROR: \n\n" + JSON.stringify(error, null, 4) + "\n\n" + error.stack);
    console.error(error);
}

function getSortedApplicationEvents(applicationEvents) {
    return applicationEvents.sort((e1, e2)=>{
            return new Date(e1.date) - new Date(e2.date);
        })
}

function getDateSortedLeavesArray(leaves, isAscending=false) {
    return leaves.sort((a1, a2)=>{
        if(isAscending)
            return new Date(a1.dateOfApplication) - new Date(a2.dateOfApplication)
        else 
            return new Date(a2.dateOfApplication) - new Date(a1.dateOfApplication)
    })
}

module.exports = {
    prettyDate: prettyDate,
    handleGetError: handleGetError,
    getSortedApplicationEvents: getSortedApplicationEvents,
    getDateSortedLeavesArray: getDateSortedLeavesArray
}