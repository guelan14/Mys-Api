const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth");
const passport = require("passport");

router.post("/api/register", AuthController.register);
router.post("/login/local", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message }); // Envía un mensaje de error en caso de autenticación fallida
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "Autenticación exitosa" }); // Envía un mensaje de éxito si la autenticación es exitosa
    });
  })(req, res, next);
});
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    successRedirect: "http://localhost:5173",
  })
);

router.get("/login/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    const userAuthenticate = {
      _id: req.user._id,
      name: req.user.fullname,
      image: req.user.image,
    };
    return res.status(200).send({ message: "succes", user: userAuthenticate });
  } else {
    return res.status(401).send({ error: false, message: "Unauthorized" });
  }
});

router.get("/logout", (req, res, next) => {
  res.clearCookie("connect.sid");
  req.logout(function (err) {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.redirect("/login"); // Redirige a /login si hay un error al cerrar sesión
    }

    req.session.destroy(function (err) {
      if (err) {
        console.error("Error al destruir la sesión:", err);
        return res.redirect("/login"); // Redirige a /login si hay un error al destruir la sesión
      }

      // La sesión se ha destruido correctamente, ahora puedes redirigir al usuario
      res.redirect("http://localhost:5173/login");
    });
  });
});

module.exports = router;
