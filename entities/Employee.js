const defaultLeavesRemaining = 10;

class Employee{

    constructor(EID, name, deptName, leavesRemaining, penaltyLeaves){
        this.EID = EID;
        this.name = name;
        this.deptName = deptName;
        this.leavesRemaining = leavesRemaining;
        this.penaltyLeaves = penaltyLeaves;
    }
}

function parseEmployees(rowJsonArray){
    let employeeArr = [];
    rowJsonArray.forEach(rowJson => {
        let e = new Employee(
            rowJson['eid'],
            rowJson['name'],
            rowJson['deptname'],
            rowJson['leavesremaining'],
            rowJson['penaltyleaves'],
        )
        employeeArr.push(e);
    });
    return employeeArr;
}

module.exports = {
    parseEmployees: parseEmployees,
    Employee: Employee
}
