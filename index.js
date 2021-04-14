const express = require('express');

require('./preinit') // to add colors to console logging :)


const testroutes = require('./routes/testroute')
const loginRoute = require('./routes/loginroute');
const session = require('express-session');
const secrets = require('./secrets');


let app = express()

app.use(express.static('public')) // static files

app.set('view engine', 'ejs'); // view engine

// express session manager
app.use(session({
    secret: "Shh, its a secret!",
    httpOnly : false,
    resave: false,
    saveUninitialized: false,
    cookie : {
      maxAge: 1000*60*60, // 1 hr in milliseconds
      sameSite: true,
    }
}));
  
app.use(express.urlencoded({
    extended: true
})) // to enable parsing paramters from post requests

app.use("/login", loginRoute)

app.use("/test", testroutes)

app.get("/", (req, res)=>{
    res.send("this is my home page");
})

app.listen(3001)