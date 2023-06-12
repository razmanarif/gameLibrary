const express = require('express');
const server = express();
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts')
const mongoose = require("mongoose")
const methodOverride = require('method-override')


// add controllers as constants here
const consoleController = require('./controllers/consoleController')

mongoose.connect(process.env.MONGO).then(()=> console.log("Connected to database"))

// add middlewares here
server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));
server.use(expressLayouts);
server.set("view engine", "ejs");
server.use(methodOverride('_method'))

//authorisation controllers go here

// server.use controllers here
server.use("/", consoleController)

server.listen(process.env.PORT, () => {
    console.log(`Connected to express on ${process.env.PORT}`)
})