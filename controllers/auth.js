const User = require("../models/user");
const bcrypt = require("bcrypt");

//user registration
const register = (req, res) => {
  // Cargar datos desde la solicitud
  let params = req.body;

  // Validación de parámetros
  if (
    !params.email ||
    !params.name ||
    !params.subname ||
    !params.password ||
    !params.confirm_password
  ) {
    return res.status(500).json({
      status: "error",
      message: "Need more data",
    });
  }

  if (params.password !== params.confirm_password) {
    return res.status(500).json({
      status: "error",
      message: "Passwords do not match",
    });
  }

  // Control de duplicación
  User.findOne({ email: params.email.toLowerCase() })
    .then(async (user) => {
      if (user) {
        return res.status(200).json({
          status: "success",
          message: "The user already exists",
        });
      }

      // Crear el campo fullname combinando name y subname
      const fullname = params.name + " " + params.subname;

      // Encriptar contraseña
      let pwd = await bcrypt.hash(params.password, 10);
      params.password = pwd;

      // Crear objeto de usuario
      let user_to_save = new User({
        email: params.email,
        name: params.name,
        subname: params.subname,
        fullname: fullname,
        password: params.password,
      });

      // Guardar usuario en la base de datos
      user_to_save
        .save()
        .then((userStored) => {
          return res.status(200).json({
            status: "success",
            message: "Registration success",
          });
        })
        .catch((error) => {
          return res.status(500).json({
            status: "error",
            message: "Error in saving the user",
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuarios",
      });
    });
};

module.exports = { register };
