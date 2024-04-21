const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res
      .status(401)
      .send("No estás autorizado para acceder a esta página");
  }
};

module.exports = isLoggedIn;
