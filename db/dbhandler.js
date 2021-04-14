const {Pool} = require('pg')
const secrets = require('../secrets')

const pool = new Pool(
    secrets.pgsql
)


async function getCountOfEmployeesWithEid(eid) {
    // returns 1: if eid exists, 0 if not, -1 if error!
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


module.exports = {
    getCountOfEmployeesWithEid: getCountOfEmployeesWithEid
}