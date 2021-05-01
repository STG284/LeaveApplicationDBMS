const express = require('express')
const dbhandler = require('../db/dbhandler')
const loginRouter = express.Router()

loginRouter.get("/", (req, res)=>{
    if(req.query.next !== undefined && req.query.next !== null 
        && req.query.next.length > 0)
        res.render("./pages/login.ejs", {next:req.query.next})
    else
        res.render("./pages/login.ejs", {next:"/"})
})

loginRouter.post("/", async (req, res)=>{

    let eid = Number.parseInt(req.body.eid);

    console.log("loginroute: post_login: eid: ", eid, ", type: ", typeof eid);
    if(! Number.isInteger(Number(eid))){
        res.status(400).send({
            "result" : "error",
            "message" : "invalid eid!"
        })
        //todo: replace with error message!
    }else{
        let doesEmployeeExists = await dbhandler.doesEmployeeExists(eid)
        
        if(doesEmployeeExists){
            req.session.EID = eid;
            console.log("redirecting to: " + req.query.next)

            if(req.query.next !== undefined && req.query.next !== null)
                res.redirect(req.query.next)
            else
                res.redirect("/employee")
        }else{
            res.send({
                "status": "error",
                "messsage": `user with eid = ${eid} doesn't exists!`
            })
        }
        
    }
    
})

module.exports = loginRouter