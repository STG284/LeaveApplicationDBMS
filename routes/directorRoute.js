const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError, getSore } = require('../utils/utils')
const directorRoute = express.Router()

directorRoute.get("/designationChange", async (req, res) => {

    try {

        if (req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        if (!await dbhandler.isDirector(req.session.EID))
            throw Error('Only Director is allowed to access this page!')

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        res.render("./pages/designationChange.ejs", { 
            employee: employee,
            specialDesignation: specialDesignation
        })

    } catch (error) {
        handleGetError(res, error)
    }
})

// shows all leaves in the system, view only mode
directorRoute.get("/allLeaves", async (req, res) => {

    try {

        if (req.session.EID == undefined || req.session.EID.length == 0)
            throw Error(`Invalid EID '${req.session.EID}'`)

        if (!await dbhandler.isDirector(req.session.EID))
            throw Error('Only Director is allowed to access this page!')

        // todo: do unauthorised check

        let employee = await dbhandler.getEmployee(req.session.EID)
        let allLeaves = await dbhandler.getAllLeaves()
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        let sortedAllLeaves = allLeaves.sort((a1, a2)=>{
            return new Date(a2.dateOfApplication) - new Date(a1.dateOfApplication)
        })

        res.render("./pages/myLeaves.ejs", {
            employee: employee,
            specialDesignation: specialDesignation,
            myLeaves: sortedAllLeaves,
            prettyDate: prettyDate,
        })

    } catch (error) {
        handleGetError(res, error)
    }
})



module.exports = directorRoute
