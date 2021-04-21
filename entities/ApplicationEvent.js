
class ApplicationEvent{
    constructor(LID, byEID, time, content, newStatus){
        this.LID = LID
        this.byEID = byEID
        this.time = time
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
            rowJson['time'],
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