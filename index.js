const express = require('express');

require('./utils/preinit') // to add colors to console logging :)


const testroutes = require('./routes/testroute')
const loginRoute = require('./routes/loginroute');
const employeeRoute = require('./routes/employeeRoute')
const leavesRouter = require('./routes/leavesRoute');

const session = require('express-session');
const secrets = require('./secrets');


let app = express()

// console.log("__dirname : " + __dirname)
app.use(express.static(__dirname + '/public')); // static files

app.use('*/css',express.static('public/css'));
app.use('*/js',express.static('public/js'));
app.use('*/images',express.static('public/images'));

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
})) // to enable parsing parameters from post requests


// access test without login, so keeping above the login-check-middleware
app.use("/test", testroutes)

app.get("/logout", (req, res)=>{
    req.session.EID = undefined
    res.redirect("/")
})


app.use("/login", loginRoute)

// redirect to login screen if not logged in!
app.use((req, res, next)=>{
    console.log("recieved index.js here: " + req.url)
    if(req.session.EID === undefined){
        res.redirect("/login?next=" + req.url)
    }else{
        next()
    }
})


app.get("/", (req, res)=>{
    if(req.session.EID === undefined){
        res.redirect("/login")
    }else{
        res.redirect("/employee")
    }
    
})

app.use("/employee", employeeRoute)

app.use("/leaves", leavesRouter)


app.listen(3001)