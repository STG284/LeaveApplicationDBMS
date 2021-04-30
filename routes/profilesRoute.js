const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate, handleGetError, getSortedApplicationEvents } = require('../utils/utils')
const profilesRouter = express.Router()

profilesRouter.get("/", (req, res)=>{
    res.redirect("profiles/all")
})


profilesRouter.get("/all", async (req, res)=>{
    try {

        let employee = await dbhandler.getEmployee(req.session.EID)
        let specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)

        // todo: pass relevant data to show Profile page
        
        res.render("./pages/profiles.ejs", { 
            employee: employee, 
            specialDesignation: specialDesignation
        })

    } catch (error) {
        handleGetError(res, error)
    }
})

profilesRouter.get("/:qeid", async (req, res)=>{
    
    try {
        let employee = null;
        let specialDesignation = null;

        let qeid = req.params.qeid; // query EID

        if (req.session.EID != undefined && req.session.EID.length != 0){
            employee = await dbhandler.getEmployee(req.session.EID)
            specialDesignation = await dbhandler.getAssignedSpecialDesignation(req.session.EID)
        }        

        if (qeid == undefined || qeid.length == 0){
            throw Error(`Invalid EID: ${qeid}`)
        }

        // todo: pass relevant data to show Profile page
        
        res.render("./pages/aProfile.ejs", { 
            employee: employee, 
            specialDesignation: specialDesignation
        })

    } catch (error) {
        handleGetError(res, error)
    }

})


module.exports = profilesRouter
