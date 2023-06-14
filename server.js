const express = require('express');
const server = express();
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts')
const mongoose = require("mongoose")
const methodOverride = require('method-override')
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./config/passport.config");
const MongoStore = require("connect-mongo");


// add controllers as constants here
const consoleController = require('./controllers/consoleController')
const authController = require('./controllers/authController')

mongoose.connect(process.env.MONGO).then(()=> console.log("Connected to database"))

// add middlewares here
server.use(methodOverride('_method'))
server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));
server.use(expressLayouts);
server.set("view engine", "ejs");


//authorisation controllers go here
server.use(
    session({
      secret: process.env.SECRET,
      saveUninitialized: true,
      resave: false,
      cookie: { maxAge: 360000 },
      store: MongoStore.create({
        mongoUrl: process.env.MONGO, //Store session in mongodb to preview re-login on server reload
      }),
    })
  );
  //-- passport initialization
server.use(passport.initialize());
server.use(passport.session());
server.use(flash());
server.use(express.static("public"));

server.use(function (request, response, next) {
    // before every route, attach the flash messages and current user to res.locals
    response.locals.alerts = request.flash(); //{ success: [], error: []}
    response.locals.currentUser = request.user; //Makes logged in user accessibile in ejs as currentUser.
    next();
  });

// server.use controllers here
server.use("/", consoleController)
server.use("/auth", authController)

server.listen(process.env.PORT, () => {
    console.log(`Connected to express on ${process.env.PORT}`)
})