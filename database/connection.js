const mongoose = require("mongoose");

require("dotenv").config();

const connection = async () => {
  const url = process.env.DB_STRING;
  try {
    await mongoose.connect(url);
    console.log("Conexión establecida correctamente");
  } catch (error) {
    console.error(error);
    throw new Error("Conexión a la base de datos fallida");
  }
};

module.exports = connection;
