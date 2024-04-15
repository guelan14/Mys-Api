const express = require("express");
const session = require("express-session");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcrypt");

//persist user data after succesful authentication
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//retrieve user data from session
passport.deserializeUser(async (id, done) => {
  try {
    const userObject = await User.findById(id);
    const user = {
      _id: userObject._id,
      name: userObject.fullname,
      image: userObject.image,
    };
    done(null, userObject);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      const newUser = {
        name: profile.name.givenName,
        subname: profile.name.familyName,
        fullname: `${profile.name.givenName} ${profile.name.familyName}`,
        image: profile.photos[0].value,
        googleId: profile.id,
        email: profile.emails[0].value,
        password: "prueba",
      };
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

module.exports = router;
