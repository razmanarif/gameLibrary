const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/userModel");

/*
 * Passport "serializes" objects to make them easy to store, converting the
 * user to an identifier (id)
 */
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

/**
 * ----------------
 * WHAT DOES DE SERIALIZE USER MEAN?
 * 1. Passport JS conveniently populates the "userObj" value in the deserializeUser() with the object attached at the end of "req.session.passport.user.{..}"
 * 2. When the done (null, user) function is called in the deserializeUser(), Passport JS takes this last object attached to "req.session.passport.user.{..}", and attaches it to "req.user" i.e "req.user.{..}"
 * In our case, since after calling the done() in "serializeUser" we had req.session.passport.user.{id: 123, name: "Kyle"},
 * calling the done() in the "deserializeUser" will take that last object that was attached to req.session.passport.user.{..} and attach to req.user.{..}
 * i.e. req.user.{id: 123, name: "Kyle"}
 * 3. So "req.user" will contain the authenticated user object for that session, and you can use it in any of the routes in the Node JS app.
 * eg.
 * app.get("/dashboard", (req, res) => {
 * res.render("dashboard.ejs", {name: req.user.name})
 * })
 */
passport.deserializeUser(function (id, cb) {
  User.findById(id)
    .then((user) => {
      cb(null, user);
    })
    .catch((err) => {
      cb(err, false);
    });
});

/*
 * This is Passport's strategy to provide local authentication. We provide the
 * following information to the LocalStrategy:
 *
 * Configuration: An object of data to identify our authentication fields, the
 * username and password
 *
 * Callback function: A function that's called to log the user in. We can pass
 * the email and password to a database query, and return the appropriate
 * information in the callback. Think of "cb" as a function that'll later look
 * like this:
 *
 * login(error, user) {
 *   // do stuff
 * }
 *
 * We need to provide the error as the first argument, and the user as the
 * second argument. We can provide "null" if there's no error, or "false" if
 * there's no user.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "password",
    },
    function (phone, password, cb) {
      User.findOne({ phone: phone })
        .then((user) => {
          if (!user) {
            return cb(null, false, { message: "User not found" });
          }
          //check if password is a match
          if (!user.validPassword(password)) {
            return cb(null, false, { message: "Password not a match" });
          }
          return cb(null, user);
        })
        .catch((err) => {
          cb(err);
        });
    }
  )
);

module.exports = passport;
