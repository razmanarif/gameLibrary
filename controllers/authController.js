const router = require("express").Router();
const passport = require("passport");
const User = require("../models/userModel");
const { upload } = require("../config/multer.config"); //multer upload for image upload

router.get("/register", (req, res) => {
  res.render("auth/register");
});

router.post("/register",  upload.single('profilePicture'), async (req, res) => {
  try {
    const user = new User({...req.body, profilePicture: req.file.filename});
    //TODO: Allow user to register and upload image
    await user.save();
    res.redirect("/auth/login");
  } catch (e) {
    //Catch error
  }
});

router.get("/login", (req, res) => {
  req.flash("success", "Flash is back!");
  res.render("auth/login");
});

/**
 * Handles the login
 */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    successFlash: "Successfully logged in",
  })
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/auth/login");
  });
});

module.exports = router;
