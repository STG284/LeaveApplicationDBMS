const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError } = require('../utils/utils')
const employeeRouter = express.Router()


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

// leaves which this user have taken
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

// leave requests which this user has received
employeeRouter.get("/MyLeaveRequests", async (req, res)=>{

    try {
        
        let employee = await dbhandler.getEmployee(req.session.EID)
        let leaveRequests = await dbhandler.getLeaveRequests(req.session.EID)
        
        res.render("./pages/myLeaves.ejs", {
            employee: employee, myLeaves:leaveRequests,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }

})


employeeRouter.get("/NewLeaveApplication", async (req, res)=>{
    try {
        
        let employee = await dbhandler.getEmployee(req.session.EID)
        
        res.render("./pages/newLeaveApplication.ejs", {
            employee: employee,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }
    
})


module.exports = employeeRouter
