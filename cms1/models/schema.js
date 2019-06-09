const mongoose = require("mongoose");

let Usercomplains = new mongoose.Schema({
    title: { type: String },
    officer: {type: String},
    complain: { type: String },
    status: { type: String },
});

let schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
    complains: [Usercomplains]
});

module.exports = mongoose.model( "User", schema );