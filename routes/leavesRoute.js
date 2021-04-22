const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError, getSortedApplicationEvents } = require('../utils/utils')
const leavesRouter = express.Router()

leavesRouter.get("/:lid", async (req, res)=>{
    console.log("get request received leavesRouter")
    try {
        if(req.params.lid == undefined || req.params.lid.length == 0)
            throw Error(`Invalid LID '${req.params.lid}'`)

        if(req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        let lid = req.params.lid
        let leaveApplication = await dbhandler.getLeaveApplication(lid)
        let applicationEvents = await dbhandler.getApplicationEvents(lid)

        if(leaveApplication == undefined)
            throw Error(`Invalid No LeaveApplication with LID '${req.params.lid}'`)

        console.log("leaveApplication", leaveApplication)
        console.log("events", applicationEvents)
        
        let _isChecker = await dbhandler.isChecker(employee.EID, leaveApplication.LID)
        let _canAddEvent = dbhandler.canAddEvent(_isChecker, leaveApplication.status)

        // console.log(employee.EID, leaveApplication.LID, _isChecker, leaveApplication.status)

        res.render("./pages/leaveApplicationDetail.ejs", {
            employee: employee, 
            specialDesignation: specialDesignation,
            leaveApplication: leaveApplication,
            applicationEvents: getSortedApplicationEvents(applicationEvents),
            prettyDate: prettyDate,
            canAddEvent: _canAddEvent,
            isChecker: _isChecker
        })

    } catch (error) {
        handleGetError(res, error)
    }
})


// POST REQUESTS :-

leavesRouter.post("/:lid/addEvent", async (req, res)=>{
    console.log("post request received leavesRouter: " + req.url + "\n\n", req.body)

    try {
        if(req.params.lid == undefined || req.params.lid.length == 0)
            throw Error(`Invalid LID '${req.params.lid}'`)

        if(req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        await dbhandler.addApplicationEvent(req.params.lid, req.session.EID, req.body.content, req.body.newStatus)
        
        res.redirect("/leaves/"+req.params.lid)

    } catch (error) {
        handleGetError(res, error)
    }
})




module.exports = leavesRouter
