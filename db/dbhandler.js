const {Pool} = require('pg')
const secrets = require('../secrets')
const Constants = require('../utils/constants')
const dateformat = require("dateformat")
const { LeaveApplicationType } = require('../utils/constants')
const { parseLeaveApplications } = require('../entities/LeaveApplication')
const { parseSpecialDesignations } = require('../entities/SpecialDesignation')
const { parseApplicationEvents } = require('../entities/ApplicationEvent')
const { parseLeaveRoutes } = require('../entities/LeaveRoute')
const { parseEmployees } = require('../entities/Employee')

const pool = new Pool(
    secrets.pgsql
)

// todo: just for test purpose
async function executeTestQuery(query) {
    try{
        let dbmsRes = await pool.query(query);
        return dbmsRes;
    }catch(e){
        console.error("DBMS error", e);
        throw(e) // to let calling function know of the error
    }
}

async function getCountOfEmployeesWithEid(eid) {
    // returns 1: if eid exists, 0 if not, -1 if error!
    let finalres = -1;
    try{
        let res = await pool.query(`SELECT True from Employee WHERE eid=${eid};`);
        console.log("received results = ", res);
        finalres = res['rowCount'];
    }catch(e){
        console.error("DBMS error", e);
        finalres = -1;
    }
    return finalres;
}

// async function hasAnActiveLeaveApplication(eid){
//     // returns 1 if application already exists, 0 if not, -1 if error!
//     let finalres = -1;
//     try{
//         let dbmsRes = await pool.query(`
//             SELECT LID from LeaveApplication 
//                 where EID = ${eid} 
//                 and status <> 'pending' 
//                 and status <> 'rejected';
//             `);
//         finalres = dbmsRes['rowCount'] // as there can be only one Leave Application, this should be always 1 !
//     }catch(e){
//         console.error("DBMS error", e);
//         finalres = -1;
//     }
//     return finalres;
// }

function sleep(ms) {
    console.error("sleeping for " + ms + " ms")
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

async function getEmployee(EID) {
    try{
        let result = await pool.query(`
            SELECT * FROM Employee
            WHERE EID = ${EID};`)
        return parseEmployees(result['rows'])[0]
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function createLeaveApplication(EID, content, startDate, endDate) {
    // startDate and endDate should be of type Date!

    const client = await pool.connect()

    try{
        // starting new transaction:
        await client.query("BEGIN;")
        
        // acquire lock for this user first:
        await client.query(`
            UPDATE ApplicationRowLock
                SET isLALocked=True 
                WHERE ApplicationRowLock.EID = ${EID};`)
        
        // Get count of all LeaveApplication from this employee
        let dbmsRes = await client.query(`
            SELECT LID from LeaveApplication 
                where EID = ${EID} 
                and (status = 'pending' or status = 'rejected');`);
        
        // console.log("received dbmsRes: ", dbmsRes);
        if(dbmsRes['rows'].length > 0)
            throw Error("Employee already has a pending/rejected Leave Application with LID:"+dbmsRes['rows'][0]['lid'])

        // Now, creating leave application:

        let startDate_s = dateformat(startDate, Constants.DATE_PGSQL_FORMAT)
        let endDate_s = dateformat(endDate, Constants.DATE_PGSQL_FORMAT)
        console.log("startDate_s: ", startDate_s, "endDate_s:", endDate_s)
        console.log("startDate: ", startDate, "endDate:", endDate)

        //check if user has special designation:
        let specialDesigRes = await client.query(`
            SELECT * FROM SpecialDesignation 
                WHERE EID = ${EID}
                AND startDate <= now()
                AND endDate > now();`)
        
        let thisLAType = LeaveApplicationType.Normal; 
        
        // Note: special leave is special even if it is retrospective as well
        if(specialDesigRes['rowCount']>0){
            // has special designation
            thisLAType = LeaveApplicationType.Special;
        }else if(startDate.getTime() < new Date().getTime()){
            // retrospective leave!
            thisLAType = LeaveApplicationType.Retrospective;
        }
        
        let createLARes = await client.query(`
            INSERT INTO LeaveApplication(EID, type, leaveStartDate, leaveEndDate, content)
                Values(${EID}, '${thisLAType}', '${startDate_s}', '${endDate_s}', '${content}') returning LID;`);

        let lid = createLARes.rows[0]['lid']

        // resetting the lock for this user:
        await client.query(`
            UPDATE ApplicationRowLock
                SET isLALocked=False 
                WHERE ApplicationRowLock.EID = ${EID};`)
        
        // commiting the transaction
        await client.query("COMMIT;")

        console.log("returning:" + lid)
        return lid

    } catch (e) {
        await client.query('ROLLBACK')
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    } finally {
        //this block will be executed whatever maybe the case!, even if you return something in try or catch blocks!
        client.release() 
        console.log("Client released!")
    }
        
}

async function addApplicationEvent(LID, byEID, content, newStatus) {
    const client = await pool.connect()
    try{
        await pool.query(`
            INSERT INTO ApplicationEvent(LID, byEID, time, content, newStatus)
                VALUES(${LID}, ${byEID}, now(), '${content}', '${newStatus}');`)
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getMyLeaves(EID) {

    try{
        let result = await pool.query(`
            SELECT * from LeaveApplication
                WHERE EID = ${EID};
        `)
        return parseLeaveApplications(result['rows'])
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function isDirector(EID) {
    try{
        let result = await pool.query(`
            SELECT EID FROM SpecialDesignation 
                WHERE designation = 'Director' 
                    AND startDate <= now() 
                    AND endDate > now()
                    AND EID = ${EID};`)

        return result['rowCount']>0 // count should be 1 if EID is director or 0 id not
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getAllLeaves() {

    try{
        let result = await pool.query(`
            SELECT * from LeaveApplication;`)
        return parseLeaveApplications(result['rows'])
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getAssignedSpecialDesignation(EID) {
    try{
        let result = await pool.query(`
            SELECT * from SpecialDesignation
                WHERE EID = ${EID}
                    AND startDate <= now()
                    AND endDate > now();`)
        let specialDesigRes = parseSpecialDesignations(result['rows'])
        
        if(specialDesigRes.length > 1){
            console.error("result = ", result)
            throw Error("\n\nSomething is seriously wrong! " + EID + " has more than one valid specialdesignations!!")
        }
        return specialDesigRes.length==1? specialDesigRes[0] : null;
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getLeaveRequests(EID) {
    try{
        let sd = await getAssignedSpecialDesignation(EID)
        if (sd === null){
            return [];
        }
        console.log("sd: ", sd)

        let result = await pool.query(`
            SELECT * FROM LeaveApplication
            WHERE LID IN
                (SELECT LID FROM LeaveRoute
                    WHERE designation = '${sd.designation}'
                        AND type_or_dept = '${sd.type_or_dept}'
                );
        `)
        return parseLeaveApplications(result['rows'])
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }  
}

async function getLeaveApplication(LID) {
    try{
        let result = await pool.query(`
            SELECT * from LeaveApplication
                WHERE LID = ${LID};
        `)
        return parseLeaveApplications(result['rows'])[0]
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getApplicationEvents(LID) {
    try{
        let result = await pool.query(`
            SELECT * from ApplicationEvent
                WHERE LID = ${LID};`)
        return parseApplicationEvents(result['rows'])
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

async function getLeaveApplicationRoute(LID) {
    try{
        let result = await pool.query(`
            SELECT * from LeaveRoute
                WHERE LID = ${LID};`)
        return parseLeaveRoutes(result['rows']).sort((r1, r2)=>{
            return r1.position - r2.position
        })
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}


async function isChecker(EID, LID) {
    let allReq = await getLeaveRequests(EID);
    // console.log("allReq: ", allReq)
    
    let _isChecker = false; // Note: applicant and any other person all are not checkers

    allReq.forEach(aReq=>{
        if(aReq.LID === LID) 
            _isChecker = true;
    });

    return _isChecker
}



function canAddEvent(isChecker, currentStatus) {
    if(isChecker){
        switch (currentStatus) {
            case Constants.LeaveStatus.pending:
                return true;        
            default:
                return false;
        }
    }else{
        switch (currentStatus) {
            case Constants.LeaveStatus.rejected:
                return true;
            default:
                return false;
        }
    }
}

// terminate all those applications for which start time has already pass 
//      but they are still pending or rejected
// returns LIDs of all the applications systemTerminated!
// else throws error
async function systemTerminateApplicationsIfRequired() {
    const sysRejContent = ""
    const sysRejbyEID = -1
    const sysRejEvent = Constants.LeaveStatus.systemTerminated;
    try{
        let result = await pool.query(`
            SELECT LID FROM LeaveApplication
                WHERE startDate <= now() 
                    AND (status = 'pending' OR status = 'rejected');`);
        
        let allPromises = []
        result['rows'].forEach(toTerminateLID => {
            // not waiting for this to complete!
            let apromise = 
                pool.query(`
                    INSERT INTO ApplicationEvent(LID, byEID, time, content, newStatus)
                        VALUES(${toTerminateLID}, ${sysRejbyEID}, now(), '${sysRejContent}', ${sysRejEvent});`)
            allPromises.push(apromise)
        });
        // waiting for all concurrent queries to complete
        await Promise.all(allPromises)
        return result['rows'] //returning LIDs
    } catch (e) {
        console.error(e.stack)
        throw(e) //rethrowing error to let the router catch and return error message
    }
}

module.exports = {
    // for tests
    executeTestQuery: executeTestQuery,
    
    // setters
    createLeaveApplication: createLeaveApplication,
    addApplicationEvent: addApplicationEvent,

    // getters
    getMyLeaves: getMyLeaves,
    getAllLeaves: getAllLeaves,
    getLeaveRequests: getLeaveRequests,
    getLeaveApplication: getLeaveApplication,
    getApplicationEvents: getApplicationEvents,
    getEmployee: getEmployee,
    getCountOfEmployeesWithEid: getCountOfEmployeesWithEid,
    getAssignedSpecialDesignation: getAssignedSpecialDesignation,
    getLeaveApplicationRoute: getLeaveApplicationRoute,

    // authCheck
    isChecker: isChecker,
    isDirector: isDirector,
    canAddEvent: canAddEvent,

    // for scheduler
    systemTerminateApplicationsIfRequired: systemTerminateApplicationsIfRequired,
}