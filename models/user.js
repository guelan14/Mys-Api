const { Schema, model } = require("mongoose");

const UserSchema = Schema({
  name: { type: String, require: true },
  subname: { type: String, require: false },
  fullname: { type: String, require: false },
  nick: { type: String },
  email: { type: String, require: true },
  password: { type: String, require: true },
  role: { type: String, default: "role_user" },
  image: { type: String, default: "default.webp" },
  created_at: { type: Date, default: Date.now },
  bio: { type: String },
  googleId: { type: String, require: false },
});

module.exports = model("User", UserSchema, "users");
