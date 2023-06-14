/**
 * @description Checks to see if user is Authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports = function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/auth/login");
    } else {
      next();
    }
  };
  