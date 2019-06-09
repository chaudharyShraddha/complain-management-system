const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");

let router = express.Router();

//load model
let User = require("../models/schema");

//Login page
router.get("/login", (req,res) => {res.render("login")});

//Signup page
router.get("/signup", (req,res) => {res.render("signup")});

//Signup POST
router.post("/signup", (req,res) => {
    const { name, email, password, password2 } = req.body;
    
    let errors = [];
    //Validation Fields
    if(!name || !email || !password || !password2){
        errors.push({ msg: "Please fill in all fields" });
    };
    if(password != password2){
        errors.push({ msg: "Password do not match" });
    };
   if(password.length < 6){
        errors.push({ msg: "Password mush be at least 6 char"});
    };

    if(errors.length > 0){
        res.render("signup",{ errors, name, email, password, password2 });
    }
    else{
        //Email is exist or not
        User.findOne({email: email})
            .then(user => {
                if(user){
                    errors.push({msg: "Email is already in used"});
                    res.render("signup",{errors,name,email,password,password2});
                }
                else{
                //Validation passed.
                let newUser = new User({name,email,password,type:"normal"});
                    //password Salt
                    bcrypt.genSalt(5, (err,salt) =>
                        bcrypt.hash(newUser.password, salt, (err,hash) => {
                            if(err) throw err;
                            // password hashed.
                            newUser.password = hash;
                            
                            //save user
                            newUser.save()
                                .then(user => {
                                    // Flash message
                                    req.flash("success_msg", "You are now registerd in and can log in");
                                    res.redirect("/user/login")
                                }).catch(err => console.log(err) );
                        })
                    );
                }
            });       
    }
});

//Login POST
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req, res, next);
});

module.exports = router;