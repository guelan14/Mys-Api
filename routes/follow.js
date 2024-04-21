const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const isLoggedIn = require("../middlewares/checkAuth");

router.get("/test-follow", FollowController.followTest);
router.post("/save/:id", FollowController.save);
router.delete("/unfollow/:id", isLoggedIn, FollowController.unfollow);
router.get(
  "/following-number/:id",
  isLoggedIn,
  FollowController.followingsNumber
);
router.get(
  "/follower-number/:id",
  isLoggedIn,
  FollowController.followersNumber
);
router.get(
  "/follows-data/:id?/:page?",
  isLoggedIn,
  FollowController.followUserIds
);
router.get("/findOne/:id", isLoggedIn, FollowController.findOne);
router.get("/followers/:id?/:page?", isLoggedIn, FollowController.followers);

module.exports = router;
