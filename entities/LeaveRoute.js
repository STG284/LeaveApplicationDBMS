
class LeaveRoute{
    constructor(lid, position, designation, type_or_dept, isApproved){
        this.lid = lid
        this.position = position
        this.designation = designation
        this.type_or_dept = type_or_dept
        this.isApproved = isApproved
    }
}

function parseLeaveRoutes(rowsJsonArray) {
    let leaveRoutes = []
    rowsJsonArray.forEach(rowJson => {
        let thisLR = new LeaveRoute(
            rowJson['lid'],
            rowJson['position'],
            rowJson['designation'],
            rowJson['type_or_Dept'],
            rowJson['isapproved']
        )
        leaveRoutes.push(thisLR)
    });
    return leaveRoutes;
}


module.exports = {
    LeaveRoute: LeaveRoute,
    parseLeaveRoutes: parseLeaveRoutes
}