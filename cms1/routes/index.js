const express = require("express");
const bcrypt = require("bcrypt");

let router = express.Router();

let User = require("../models/schema");

//welcome page
router.get("/", (req,res) => res.render("home"));

//Dashboard page
router.get("/dashboard",secureRoutes,(req,res) => {
   let user = req.user.type;
   
   if(user == "normal"){
      res.render("user",{user:req.user,title:"New Complain",submit:"Submit"});
   }
   if(user == "admin"){
      User.find()
      .then(data =>{
         res.render("admin",{user:req.user,data});
      }).catch(err => console.log());      
   }
});

// Submit users complain
router.post("/complain", (req,res) => {
  let userEmail = req.user.email;
  let  userComplains = {
   title :  req.body.title,
   officer: req.body.officer,
   complain: req.body.complain,
   status: "pendindg",
  }
  let errors = [];
  let str = /^[A-Za-z]/;
  //Validation filed
  if(!req.body.title || !req.body.officer || !req.body.complain){
      req.flash("error_msg", "Please enter the all fileds");
      res.redirect("/dashboard");
  }
  if (!str.test(req.body.title)){
      req.flash("error_msg", "Title must be in String");
      res.redirect("/dashboard");   
  }
  if(!str.test(req.body.complain)){
   req.flash("error_msg", "Complain should be in string");
   res.redirect("/dashboard");
  }
if(req.body.compId ==""){
    // add new complain
    User.findOne({email:userEmail})
    .then(user =>{
          user.complains.push(userComplains);
          user.save();
    }).catch(err => console.log(err));
   req.flash("success_msg","Complain is successfuly submited");
}else{
   // update complains
   User.findOne({email: userEmail})
   .then(user =>{
     let data = user.complains.id(req.body.compId);
     data.title = req.body.title;
     data.officer = req.body.officer;
     data.complain = req.body.complain;
     data.status = "pending";
     user.save();
   }).catch(err => console.log(err));
   req.flash("success_msg","Complain is successfuly updated");
}  
   res.redirect("/dashboard");
});

// Delete complains
router.get("/delete/:id", (req,res) => {
   let id = req.params.id
   User.findOne({ _id: req.user.id})
   .then(user =>{
      user.complains.remove(id);
      user.save();
   }).catch(err => console.log(err));
   res.redirect("/dashboard");
});

//show data in form for Updating complains
router.get("/update/:id", (req,res) => {
   let id = req.params.id
      User.findOne({_id: req.user.id})
      .then(user => {
         let data = user.complains.id(id);
         res.render("user",{user,data,title:"Update Complain",submit:"Update"})
      }).catch(err => console.log(err));
});

// logout
router.get("/logout", (req,res) =>{
   req.logout();
   req.flash("success_msg","You are successfully logout");
   res.redirect("/user/login");
});

// ADMIN ROUTES

// add admin or officer
router.post("/newEntry", (req,res) => {
   const { name, email, password, password2 ,type} = req.body;

   let errors =[];
   // validation field
   if(!name || !type || !email || !password || !password2){
      errors.push({ msg: "Please fill in all fields" });
   }
   if(password.length < 6){
      errors.push({ msg: "Password mush be at least 6 char"});
   }
   if(password != password2){
      errors.push({ msg: "Password do not match" });
   }
   if(errors.length > 0){
      res.render("admin",{user:req.user,errors, name, email, password, password2 });
  }

   // check user exist
   User.findOne({email: req.body.email})
   .then(user =>{
      if(user){
      req.flash("error_msg","Email is already in used");
      }else{
         let newUser = new User({name,email,password,type});

         //password hash
         bcrypt.genSalt(5, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err,hash) =>{
               if(err) throw err;

               newUser.password = hash;
               //save user
               newUser.save()
               .then(user => {
               req.flash("success_msg", "New user is successfully registered");
               res.redirect("/dashboard");
               }).catch(err => console.log(err));
            }));
      }
   })
});

// Delete users
router.get("/del/:id", (req,res) => {
   let id = req.params.id;
   User.findByIdAndDelete(id).exec();
   req.flash("success_msg", "User is successfully deleted");
   res.redirect("/dashboard");
});

// view complain-approved or reject
router.get("/complains/:id",secureRoutes, (req,res) => {
   let id = req.params.id;
   User.findById(id)
   .then(user => {
      let data = user.complains;
      // set session
      req.session.email = user.email;
      let session = req.session.email;

      res.render("complains",{user,data,session});
   }).catch(err => console.log(err));
});

// reject complain
router.get("/reject/:id",secureRoutes, (req,res) =>{
   User.findOne({email: req.session.email})
   .then(user => {
      // session
      req.session.email = user.email;
      let session = req.session.email;

      let data = user.complains;
      let doc = user.complains.id(req.params.id);
      doc.status = "reject";
      user.save();
      res.render("complains",{user,data,session});
   }).catch(err => console.log(err));
});

// approve complain
router.get("/approve/:id",secureRoutes, (req,res) =>{
   User.findOne({email: req.session.email})
   .then(user => {
      // session
      req.session.email = user.email;
      let session = req.session.email;

      let data = user.complains;
      let doc = user.complains.id(req.params.id);
      doc.status = "approve";
      user.save();     
      res.render("complains",{user,data,session});      
   }).catch(err => console.log(err));
  
});

module.exports = router;

//Secure the routes
function secureRoutes(req,res,next){
   if(req.isAuthenticated()){
      return next();
   }else{
      req.flash("error_msg","Please log in to view this resourses");
      res.redirect("/user/login");
   }
} 