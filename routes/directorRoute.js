const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError, sortApplicationEvents } = require('../utils/utils')
const directorRoute = express.Router()

directorRoute.get("/designationChange", async (req, res)=>{
    
    try {
        // if(req.params.lid == undefined || req.params.lid.length == 0)
        //     throw Error(`Invalid LID '${req.params.lid}'`)

        if(req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        let employee = await dbhandler.getEmployee(req.session.EID)

        res.render("./pages/designationChange.ejs", {employee: employee})
    } catch (error) {
        handleGetError(res, error)
    }
})

// shows all leaves in the system, view only mode
directorRoute.get("/allLeaves", async (req, res)=>{
    
    try {
        
        if(req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)
        
            // todo: do unauthorised check
            
        let employee = await dbhandler.getEmployee(req.session.EID)
        // let allLeaves = await dbhandler.getAllLeaves(req.session.EID)
        
        res.render("./pages/myLeaves.ejs", {
            employee: employee, myLeaves:[],
            prettyDate: prettyDate,
        })            

    } catch (error) {
        handleGetError(res, error)
    }
})



module.exports = directorRoute
