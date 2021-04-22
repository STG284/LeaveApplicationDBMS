const express = require('express')

const dbtesters = require('../db/tester')
const dbhandler = require('../db/dbhandler')
const constants = require('../utils/constants')

router = express.Router()

// tests will alwayse return json type!
router.use((req, res, next)=>{
    res.header("Content-Type",'application/json');
    next()
})

router.get("/1", async (req, res) => {
    let res1 = await dbtesters.performTest1()
    res.send("test home page : " + res1)
})

router.get("/2", async (req, res) => {
    let res1 = await dbtesters.performTest2()
    res.send("test home page : " + res1)
})

router.get("/3", async (req, res) => {
    let res1 = await dbtesters.performTest3()
    res.send("test home page : " + res1)
})

router.get("/4", (req, res)=>{
    res.send(`logged in as ${req.session.EID}`);
})

router.get("/newLeaveA", async (req, res)=>{
    try {
        await dbhandler.createLeaveApplication(
            6, 
            "meri marzi", 
            new Date(Date.parse("2021-05-15 18:52:31.041565+05:30")), 
            new Date(Date.parse("2021-05-17 18:52:31.041565+05:30"))
        )
        res.send("Done !");    
    } catch (error) {
        
        res.status(500)
            .send(JSON.stringify({
                status: "error",
                message: error.message
            }, null, 4));
    }
    
})

router.get("/addApplicationEvent", async (req, res)=>{
    try {
        await dbhandler.addApplicationEvent(
            2, 
            10,
            "Heavy load of work, sorry",
            `'${constants.LeaveStatus.rejected}'`
        )
        res.send("Done !");    
    } catch (error) {
        res.status(500)
            .send(JSON.stringify({
                status: "error",
                message: error.message
            }, null, 4));
    }  
})

router.get("/getMyLeaves/:eid", async (req, res)=>{
    
    try {
        let leaves = await dbhandler.getMyLeaves(req.params.eid)
        res.send(JSON.stringify(leaves, null, 4));    

    } catch (error) {
        res.status(500)
            .send(JSON.stringify({
                status: "error",
                message: error.message,
            }, null, 4));
        console.error(error.stack);
    }
})


router.get("/getLeaveRequests/:eid", async (req, res)=>{
    
    try {
        let leaves = await dbhandler.getLeaveRequests(req.params.eid)
        res.send(JSON.stringify(leaves, null, 4));    

    } catch (error) {
        res.status(500)
            .send(JSON.stringify({
                status: "error",
                message: error.message,
            }, null, 4));
        console.error(error.stack);
    }
})


router.get("/getApplicationEvents/:lid", async (req, res)=>{
    
    try {
        let events = await dbhandler.getApplicationEvents(req.params.lid)
        res.send(JSON.stringify(events, null, 4));    

    } catch (error) {
        res.status(500)
            .send(JSON.stringify({
                status: "error",
                message: error.message,
            }, null, 4));
        console.error(error.stack);
    }
})

router.get("/systemTerminateApplicationsIfRequired", async (req, res)=>{
    try{
        let terminateLIDs = await dbhandler.systemTerminateApplicationsIfRequired()
        res.send(`Terminated ${terminateLIDs.length} LIDs:\n ${JSON.stringify(terminateLIDs)}`);
    } catch(e){
        console.log(e)
        res.send("ERROR! :\n\n" + e.stack);
    }
})

router.get("/testq", async (req, res)=>{
    console.log(new Date(), ", query: ", "'" + req.query.q + "'")
    try{
        if(req.query.q == undefined) 
            throw new TypeError("Invalid Query!")

        let result = await dbhandler.executeTestQuery(req.query.q)
        console.log(result)
        res.send(JSON.stringify(result['rows'], null, 4));
    }catch(e){
        console.log(e)
        res.send("ERROR! :\n\n" + e.stack);
    }
        
})

// SELECT createNewLeaveApplication(8, 'I want some free time :)', '2021-04-15 18:52:31.041565+05:30', '2021-05-17 18:52:31.041565+05:30');

module.exports = router
