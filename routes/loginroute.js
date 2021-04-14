const express = require('express')
const dbhandler = require('../db/dbhandler')
const loginRouter = express.Router()

require('../db/dbhandler')

loginRouter.get("/", (req, res)=>{
    res.render("login.ejs")
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
        let countOfEmployees = await dbhandler.getCountOfEmployeesWithEid(eid)
        console.log("countOfEmployees:", countOfEmployees)
        switch(countOfEmployees){
            case 1: 
                req.session.EID = eid;
                res.send({
                    "status": "success",
                    "messsage": ""
                })
                break;
            case 0: 
                res.send({
                    "status": "error",
                    "messsage": `user with eid = ${eid} doesn't exists!`
                })
                break;
            case -1: 
                res.send({
                    "status": "error",
                    "messsage": "DBMS exception! :("
                })
                break;
        }
    }
    
})

module.exports = loginRouter