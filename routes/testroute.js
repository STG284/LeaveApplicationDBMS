const express = require('express')

const dbtesters = require('../db/tester')
const dbhandler = require('../db/dbhandler')

router = express.Router()

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

router.get("/5", async (req, res)=>{
    try {
        await dbhandler.createLeaveApplication(
            8, 
            "I want some free time with kids :)", 
            new Date(Date.parse("2021-04-15 18:52:31.041565+05:30")), 
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

router.get("/testq", async (req, res)=>{
    console.log(new Date(), ", query: ", "'" + req.query.q + "'")
    try{
        if(req.query.q == undefined) 
            throw new TypeError("Invalid Query!")

        let result = await dbhandler.executeTestQuery(req.query.q)
        console.log(result)
        res.header("Content-Type",'application/json');
        res.send(JSON.stringify(result['rows'], null, 4));
    }catch(e){
        console.log(e)
        res.header("Content-Type",'application/json');
        res.send("ERROR! :\n\n" + e.stack);
    }
        
})

// SELECT createNewLeaveApplication(8, 'I want some free time :)', '2021-04-15 18:52:31.041565+05:30', '2021-05-17 18:52:31.041565+05:30');

module.exports = router
