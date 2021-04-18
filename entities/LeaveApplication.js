
class LeaveApplication{
    constructor(LID, EID, dateOfApplication, type, status, leaveStartDate, leaveEndDate, content){
        this.LID = LID
        this.EID = EID
        this.dateOfApplication = dateOfApplication
        this.type = type
        this.status = status
        this.leaveStartDate = leaveStartDate
        this.leaveEndDate = leaveEndDate
        this.content = content
    }
}


function parseLeaveApplications(rowsJsonArray) {
    let leaveApplications = []
    rowsJsonArray.forEach(rowJson => {
        let thisLA = new LeaveApplication(
            rowJson['lid'],
            rowJson['eid'],
            rowJson['dateofapplication'],
            rowJson['type'],
            rowJson['status'],
            rowJson['leavestartdate'],
            rowJson['leaveenddate'],
            rowJson['content']
        )
        leaveApplications.push(thisLA)
    });
    return leaveApplications;
}

module.exports = {
    LeaveApplication: LeaveApplication,
    parseLeaveApplications: parseLeaveApplications
}