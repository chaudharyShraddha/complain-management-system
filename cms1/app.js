const express =require("express");
const hbs = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

let app = express();

//Config file
require("./config/passport")(passport);

//static file
app.use(express.static(path.join(__dirname, "public")));
//body-parser
app.use(express.urlencoded({ extended:false }));

//express-handlebars
app.engine("hbs", hbs({ extname: "hbs", defaultLayout: "layout", layoutsDir: __dirname+ "/views"}));
app.set("view engine", "hbs");

// mongoose database
mongoose.connect("mongodb://localhost:27017/cms", {useNewUrlParser: true})
.then(console.log("mongodb is connected"));

//express-session
app.use(session({secret: "shraddha", resave: true, saveUninitialized: true}))

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// connect-flash
app.use(flash());

//Global variable for flash
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));

let PORT = process.env.PORT || 8000;
app.listen(PORT, console.log("Server is runnig"));