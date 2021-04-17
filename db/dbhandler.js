const {Pool} = require('pg')
const secrets = require('../secrets')
const Constants = require('../utils/constants')
const dateformat = require("dateformat")
const { LeaveApplicationType } = require('../utils/constants')

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

        //check if user has special designation:
        let specialDesigRes = await client.query(`
            SELECT * FROM SpecialDesignation 
                WHERE EID = ${EID}
                AND startDate < now()
                AND endDate > now();`)
        
        let thisLAType = LeaveApplicationType.Normal; 
        
        // Note: special leave is special even if it is retrospective as well
        if(specialDesigRes['rowCount']>0){
            // has special designation
            thisLAType = LeaveApplicationType.Special;
        }else if(endDate.getTime() < new Date().getTime()){
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

async function addEvent(LID, byEID, content, newStatus) {
    const client = await pool.connect()
    try{
        await client.query('BEGIN;')

        await client.query(`
            INSERT INTO Events(LID, byEID, time, content, newStatus)
                VALUES(${LID}, ${byEID}, now(), '${content}', ${newStatus});
        `)

        await client.query('COMMIT;')
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

module.exports = {
    executeTestQuery: executeTestQuery,
    getCountOfEmployeesWithEid: getCountOfEmployeesWithEid,
    createLeaveApplication: createLeaveApplication,
}