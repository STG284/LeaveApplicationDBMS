const express = require('express');

require('./preinit') // to pre init :)


const testroutes = require('./routes/testroute')



let app = express()

app.use("/test", testroutes)

app.listen(3000)