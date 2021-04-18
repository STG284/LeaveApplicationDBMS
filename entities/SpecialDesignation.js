
class SpecialDesignation{
    constructor(eid, designation, type_or_dept, startDate, endDate){
        this.eid = eid
        this.designation = designation
        this.type_or_dept = type_or_dept
        this.startDate = startDate
        this.endDate = endDate    
    }
}

function parseSpecialDesignations(rowJsonArray){
    let specialDesignationArr = [];
    
    rowJsonArray.forEach(rowJson => {
        let sd = new SpecialDesignation(
            rowJson['eid'],
            rowJson['designation'],
            rowJson['type_or_dept'],
            rowJson['startdate'],
            rowJson['enddate'], // NOTE: no need to convert to date as pg already converts postgres date to node js date
        )
        specialDesignationArr.push(sd);
    });
    return specialDesignationArr;
}

module.exports = {
    SpecialDesignation: SpecialDesignation,
    parseSpecialDesignations: parseSpecialDesignations,
}
