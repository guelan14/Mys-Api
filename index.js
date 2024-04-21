//Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

require("dotenv").config();

//Database connection
connection();

//Node server
const app = express();
const port = 3900;

// Agregar manejo de ruta para favicon.ico
app.get("/favicon.ico", function (req, res) {
  res.send("<h1>Api from M.A.N.</h1>");
});

app.get("/", (req, res) => {
  res.send("<h1>Api from M.A.N.</h1>");
});

// Configuración de CORS
const corsOptions = {
  origin: "*", //["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true, // Indica que las credenciales deben ser incluidas en la solicitud
};

//config cors
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secretxD",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_STRING,
      autoRemove: "interval",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//load routes conf
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");
const AuthRoutes = require("./routes/auth");
const AuthService = require("./services/auth");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);
app.use("/", AuthRoutes);
app.use("/", AuthService);

app.listen(port, () => {
  console.log("Node is running on ", port);
});
