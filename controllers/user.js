const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
//test

const userTest = (req, res) => {
  return res.status(200).send({
    message: "Message sent from controllers/user.js",
    user: req.user,
  });
};

const profile = (req, res) => {
  const id = req.params.id;

  if (!id) {
    const user = req.user;
    return res.status(200).send({
      status: "success",
      user: user,
    });
  }

  async function obtenerUsuario(req, res) {
    try {
      const userProfile = await User.findById(id)
        .select({ password: 0, role: 0 })
        .exec();
      if (!userProfile) {
        return res.status(404).send({
          status: "error",
          message: "El usuario no existe",
        });
      }

      return res.status(200).send({
        status: "success",
        user: userProfile,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al buscar el usuario",
        error: error.message,
      });
    }
  }

  // Llamada a la función
  obtenerUsuario(req, res);
};

const searchList = (req, res) => {
  const fullName = req.params.name;
  const [name, subname] = fullName.split(" ");

  // Controlar la página
  let page = req.params.page ? parseInt(req.params.page) : 1;

  // Elementos por página
  let itemsPerPage = 5;

  // Calcular el índice de inicio de la página
  let startIndex = (page - 1) * itemsPerPage;

  // Construir expresiones regulares para nombres y apellidos parcialmente coincidentes
  const nameRegex = new RegExp(name, "i");
  const subnameRegex = new RegExp(subname, "i");

  // Realizar la consulta en la base de datos
  User.find({
    $or: [
      { name: { $regex: nameRegex } },
      { subname: { $regex: subnameRegex } },
    ],
  })
    .sort("name")
    .skip(startIndex)
    .limit(itemsPerPage)
    .then((users) => {
      User.countDocuments({
        $or: [
          { name: { $regex: nameRegex } },
          { subname: { $regex: subnameRegex } },
        ],
      })
        .then((total) => {
          return res.status(200).send({
            users,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
          });
        })
        .catch((error) => {
          return res
            .status(500)
            .send({ message: "Error al obtener el total de usuarios", error });
        });
    })
    .catch((error) => {
      return res.status(500).send({ message: "Error en la búsqueda", error });
    });
};

const getAll = (req, res) => {
  User.find()
    .then((users) => {
      if (!users) {
        return res.status(404).send({
          message: "No hay usuarios disponibles",
        });
      }
      return res.status(200).send(users);
    })
    .catch((error) => {
      return res.status(500).send({ message: "error en la busqueda" });
    });
};

const list = (req, res) => {
  //controlar la pagina
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);

  //consulta con mongoos paginate
  let itemsPerPage = 5;

  User.find()
    .sort("_id")
    .paginate(page, itemsPerPage)
    .then((users, total) => {
      if (!users) {
        return res.status(404).send({
          message: "No hay usuarios disponibles",
          page,
        });
      }

      return res.status(200).send({
        users,
        itemsPerPage,
        total,
        pages: Math.ceil(total / itemsPerPage),
      });
    })
    .catch((error) => {
      return res.status(500).send({ message: "error en la busqueda" });
    });
};

const update = async (req, res) => {
  try {
    const userIdentity = req.user;
    const userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    let userIsSet = false;

    // Buscar si el email o el nick ya existen en otro usuario
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    // Comprobar si hay algún usuario que coincida y no sea el mismo que se quiere actualizar
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsSet = true;

      if (userIsSet) {
        return res.status(200).send({
          status: "error",
          message: "The user already exists",
        });
      }
    });

    // Encriptar la contraseña si se cambia
    if (userToUpdate.password) {
      const pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }

    // Actualizar solo las propiedades que cambian en el documento
    const updatedUser = await User.findByIdAndUpdate(
      userIdentity.id,
      { $set: userToUpdate },
      { new: true }
    );

    // Enviar la respuesta con el usuario actualizado
    return res.status(200).send({
      status: "success",
      message: "metodo de actualizar usuario",
      updatedUser,
    });
  } catch (error) {
    // Enviar la respuesta con el error
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
};

const upload = async (req, res) => {
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Peticion no incluye imagen",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  if (extension != "png" && extension != "jpg" && extension != "gif") {
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "extension del fichero invalida",
    });
  }

  let userUpdated = await User.findOneAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    {
      returnOriginal: false,
    }
  );

  if (!userUpdated) {
    return res.status(500).send({
      status: "error",
    });
  } else {
    return res.status(200).send({
      status: "succes",
    });
  }
};

const avatar = async (req, res) => {
  const file = req.params.file;
  const filePath = "./uploads/avatars/" + file;
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        Message: "No existe la imagen",
      });
    }
    return res.sendFile(path.resolve(filePath));
  });
};

//Acciones Exports
module.exports = {
  userTest,
  list,
  profile,
  update,
  upload,
  avatar,
  searchList,
  getAll,
};
