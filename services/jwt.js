const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "CLAVE_SEC$RETA_987987";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.username,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(1, "days").unix(),
  };

  return jwt.encode(payload, secret);
};

module.exports = { secret, createToken };
