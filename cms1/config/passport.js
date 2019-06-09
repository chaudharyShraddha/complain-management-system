const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
let bcrypt = require("bcrypt");

//Mongoose model
let User = require("../models/schema");

module.exports = function(passport){
    passport.use(
        new localStrategy({usernameField: "email"}, 
            (email,password,done) => {
                
                // User Match
                User.findOne({email: email})
                .then(user => {
                    if(!user){
                        return done(null, false, {message: "Email is not found"});
                    }
                    // Password Match
                    bcrypt.compare(password, user.password, (err,isMatch) =>{
                        if(err) throw err;

                        if(isMatch){
                            return done(null,user);
                        }else{
                            return done(null, false, {message: "Password do not match"});
                        }
                    })
                }).catch(err => console.log(err));         
         }));

    // Serialize and de-serialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id , (err, user) => {
            done(err, user);
        });
    });
}
