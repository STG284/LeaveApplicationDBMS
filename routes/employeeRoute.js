const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError, getDateSortedLeavesArray } = require('../utils/utils')
const employeeRouter = express.Router()


employeeRouter.get("/", (req, res) => {
    res.redirect(req.baseUrl + "/dashboard")
})

employeeRouter.get("/dashboard", async (req, res) => {
    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        res.render("./pages/dashboard.ejs", { 
            employee: employee, 
            specialDesignation: specialDesignation
        })

    } catch (error) {
        handleGetError(res, error)
    }

})

// leaves which this user have taken
employeeRouter.get("/MyLeaves", async (req, res) => {
    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)
        let myLeaves = await dbhandler.getMyLeaves(req.session.EID)

        res.render("./pages/myLeaves.ejs", {
            employee: employee, 
            specialDesignation: specialDesignation,
            myLeaves: getDateSortedLeavesArray(myLeaves),
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }

})

// leave requests which this user has received
employeeRouter.get("/MyLeaveRequests", async (req, res) => {

    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)
        let leaveRequests = await dbhandler.getLeaveRequests(req.session.EID)

        res.render("./pages/myLeaves.ejs", {
            employee: employee, 
            specialDesignation: specialDesignation,
            myLeaves: leaveRequests,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }

})


employeeRouter.get("/NewLeaveApplication", async (req, res) => {
    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        res.render("./pages/newLeaveApplication.ejs", {
            employee: employee,
            specialDesignation: specialDesignation,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }

})


// POST REQUESTS :-

// new leave application post request
employeeRouter.post("/NewLeaveApplication", async (req, res) => {
    try {

        if (req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        let newLid = 
            await dbhandler.createLeaveApplication(
                req.session.EID, 
                req.body.content, 
                new Date(req.body.startDate), 
                new Date(req.body.endDate))

        res.redirect("/leaves/" + newLid)

    } catch (error) {
        handleGetError(res, error)
    }
})


module.exports = employeeRouter
