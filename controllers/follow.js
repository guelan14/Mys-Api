const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePagination = require("mongoose-paginate-v2");

const followTest = (req, res) => {
  return res
    .status(200)
    .send({ message: "Message sent from controllers/follow.js" });
};

//accion de guardar follo (seguir)
const save = async (req, res) => {
  const params = req.params.id;
  const identity = req.user;
  let userToFollow = new Follow({
    user: identity.id,
    followed: params,
  });

  try {
    await userToFollow.save();

    return res.status(200).send({
      status: "succes",
      message: "Usuario seguido",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "No se ha podido dar follow",
    });
  }
};

const findOne = async (req, res) => {
  const userId = req.user.id;
  const followedId = req.params.id;

  try {
    const follow = await Follow.findOne({
      user: userId,
      followed: followedId,
    }).exec();
    if (follow) {
      return res.status(200).send({ message: "User Followed" });
    } else {
      return res.status(404).send({ message: "User Not Followed" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Error verifying follow" });
  }
};

const unfollow = async (req, res) => {
  const userId = req.user.id;
  const followedId = req.params.id;

  try {
    await Follow.findOneAndDelete({
      user: userId,
      followed: followedId,
    }).exec();
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "No se ha podido hacer el unfollow",
    });
  }

  return res.status(200).send({
    status: "succes",
    message: "usuario unfollowed",
  });
};

const followersNumber = async (req, res) => {
  id = req.params.id;
  try {
    const followers = await Follow.countDocuments({ followed: id });
    return res.status(200).send({
      status: "succes",
      followers: followers,
    });
  } catch (error) {
    console.log("error");
  }
};

const followingsNumber = async (req, res) => {
  id = req.params.id;
  try {
    const follows = await Follow.countDocuments({ user: id });
    return res.status(200).send({
      status: "succes",
      follows: follows,
    });
  } catch (error) {
    console.log("error");
  }

  /*
  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;
  let page = 1;
  if (req.params.page) page = req.params.page;

  try {
    const follows = await Follow.find({ user: userId })
      .paginate(page, itemsPerPage)
      .populate([
        { path: "user", select: "-password -role -__v" },
        { path: "followed", select: "-password -role -__v" },
      ])
      .page(pageNumber)
      .exec();

    const total = await Follow.countDocuments({ user: userId });

    return res.status(200).send({
      status: "success",
      message: "lista de usuarios que sigo",
      follows,
      total,
      pages: Math.ceil(total / 5),
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "hubo un error en el sistema",
    });
  }*/
};

const followers = async (req, res) => {
  //Parametros
  let page = 1;
  if (req.params.page) page = req.params.page;

  const userId = req.params.id;
  console.log(userId);

  let followersUsers = await Follow.find({ user: userId }).select({
    followed: 1,
    _id: 0,
  });

  return res.status(200).send({
    status: "success",
    message: "lista de usuarios que sigue",
    followersUsers: followersUsers,
  });
};

const followUserIds = async (identityUserId) => {
  try {
    let following = await Follow.find({ user: identityUserId })
      .select({
        followed: 1,
        _id: 0,
      })
      .exec();

    let followers = await Follow.find({ followed: identityUserId })
      .select({
        user: 1,
        _id: 0,
      })
      .exec();

    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];
    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });

    return { following: followingClean, followers: followersClean };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  followTest,
  save,
  unfollow,
  followingsNumber,
  followersNumber,
  followers,
  findOne,
  followUserIds,
};
