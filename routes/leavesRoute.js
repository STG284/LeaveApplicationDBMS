const express = require('express')
const dbhandler = require('../db/dbhandler')
const { prettyDate } = require('../utils/utils')
const leavesRouter = express.Router()

require('../db/dbhandler')

leavesRouter.get("/:lid", async (req, res)=>{
    res.send("received: " + req.params.lid);

    // let employee = await dbhandler.getEmployee(req.session.EID)
    // let myLeaves = await dbhandler.getMyLeaves(req.session.EID)
    
    // res.render("./pages/myLeaves.ejs", {
    //     employee: employee, myLeaves:myLeaves,
    //     prettyDate: prettyDate,
    // })
})




module.exports = leavesRouter
