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

passport.deserializeUser(function (id, cb) {
  User.findById(id)
    .then((user) => {
      cb(null, user);
    })
    .catch((err) => {
      cb(err, false);
    });
});

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
