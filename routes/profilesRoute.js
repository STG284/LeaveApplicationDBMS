const express = require('express')
const dbhandler = require('../db/dbhandler')
const mongodbhandler = require('../mongodb/mongodbhandler')
const { prettyDate, handleGetError, getSortedApplicationEvents } = require('../utils/utils')
const profilesRouter = express.Router()

// note this section can be reached without logging in as well

profilesRouter.get("/", (req, res)=>{
    res.redirect("profiles/all")
})


profilesRouter.get("/all", async (req, res)=>{
    try {

        // console.log("req.session.EID :",req.session.EID)

        let employeeEID = null;
        let employee = null;
        let specialDesignation = null;

        if (req.session.EID != undefined && req.session.EID.length != 0){
            employeeEID = req.session.EID;
            employee = await dbhandler.getEmployee(employeeEID)
            specialDesignation = await dbhandler.getAssignedSpecialDesignation(employeeEID)
        }

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
        let employeeEID = null;
        let employee = null;
        let specialDesignation = null;

        let qeid = req.params.qeid; // query EID

        if (qeid == undefined || qeid.length == 0){
            throw Error(`Invalid EID: ${qeid}`)
        }

        // auto login !!
        // todo remove this!
        // req.session.EID = qeid;

        if (req.session.EID != undefined && req.session.EID.length != 0){
            employeeEID = req.session.EID;
            employee = await dbhandler.getEmployee(employeeEID)
            specialDesignation = await dbhandler.getAssignedSpecialDesignation(employeeEID)
        }
        

        let profile = await dbhandler.getEmployee(qeid)
        let profile_specialDesignation = await dbhandler.getAssignedSpecialDesignation(qeid)

        
        let employeeProfileDetails = await mongodbhandler.getEmployeeDetails(qeid)

        console.log("employeeProfileDetails:", employeeProfileDetails);
        res.render("./pages/aProfile.ejs", { 
            employee: employee, 
            specialDesignation: specialDesignation,
           
            profile: profile,
            profile_specialDesignation: profile_specialDesignation,
            employeeProfileDetails: employeeProfileDetails,
            allowEdits: (qeid == employeeEID)
        })

    } catch (error) {
        handleGetError(res, error)
    }

})


profilesRouter.post("/:qeid", async (req, res)=>{
    console.log("received post request at ", req.originalUrl, "\t body=", req.body)

    try {

        let qeid = req.params.qeid; // query EID

        if (qeid == undefined || qeid.length == 0){
            throw Error(`Invalid EID: ${qeid}`)
        }
        
        let updateDict = {}

        if( typeof req.body.value == "string"){
            req.body.value = req.body.value.trim();
        }else{
            //it should be array of strings!
            req.body.value = req.body.value.map((value, index)=>{
                return value.trim()
            })
        }
        updateDict[req.body.name] = req.body.value
        
        await mongodbhandler.updateEmployeeDetails(qeid, updateDict)

        res.sendStatus(200)
    } catch (error) {
        handleGetError(res, error)
    }

})

module.exports = profilesRouter
