const express = require('express')

const dbtesters = require('../db/tester')

router = express.Router()

router.get("/1", async (req, res) => {
    let res1 = await dbtesters.performTest1()
    res.send("test home page : " + res1)
})

router.get("/2", async (req, res) => {
    let res1 = await dbtesters.performTest2()
    res.send("test home page : " + res1)
})

router.get("/3", async (req, res) => {
    let res1 = await dbtesters.performTest3()
    res.send("test home page : " + res1)
})

module.exports = router
