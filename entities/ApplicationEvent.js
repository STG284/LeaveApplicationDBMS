
class ApplicationEvent{
    constructor(LID, byEID, content, newStatus){
        this.LID = LID
        this.byEID = byEID
        this.content = content
        this.newStatus = newStatus
    }
}

function parseApplicationEvents(rowJsonArray) {
    let applicationEvents = []
    rowJsonArray.forEach(rowJson => {
        let e = new ApplicationEvent(
            rowJson['lid'],
            rowJson['byeid'],
            rowJson['content'],
            rowJson['newstatus'],
        )
        applicationEvents.push(e)
    });
    return applicationEvents;
}

module.exports = {
    ApplicationEvent: ApplicationEvent,
    parseApplicationEvents: parseApplicationEvents
}