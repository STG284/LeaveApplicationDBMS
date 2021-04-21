const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError } = require('../utils/utils')
const employeeRouter = express.Router()

require('../db/dbhandler')


employeeRouter.get("/", (req,res)=>{
    res.redirect(req.baseUrl + "/myProfile")
})

employeeRouter.get("/MyProfile", async (req, res)=>{
    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        res.render("./pages/myProfile.ejs", {employee: employee})

    } catch (error) {
        handleGetError(res, error)
    }
    
})

employeeRouter.get("/MyLeaves", async (req, res)=>{
    try {
        
        let employee = await dbhandler.getEmployee(req.session.EID)
        let myLeaves = await dbhandler.getMyLeaves(req.session.EID)
        
        res.render("./pages/myLeaves.ejs", {
            employee: employee, myLeaves:myLeaves,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }
    
})


employeeRouter.get("/MyLeaves/:lid", async (req, res)=>{

    res.send("received: " + req.params.lid);

    // let employee = await dbhandler.getEmployee(req.session.EID)
    // let myLeaves = await dbhandler.getMyLeaves(req.session.EID)
    
    // res.render("./pages/myLeaves.ejs", {
    //     employee: employee, myLeaves:myLeaves,
    //     prettyDate: prettyDate,
    // })
})




module.exports = employeeRouter
