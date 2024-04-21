const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user");
const isLoggedIn = require("../middlewares/checkAuth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.get("/user-test", UserController.userTest);
router.get("/search/:name/:page?", UserController.searchList);
router.get("/profile/:id?", isLoggedIn, UserController.profile);
router.get("/list/:page?", isLoggedIn, UserController.list);
router.get("/all", isLoggedIn, UserController.getAll);
router.put("/update", isLoggedIn, UserController.update);
router.post(
  "/upload",
  [isLoggedIn, uploads.single("file0")],
  UserController.upload
);
router.get("/avatar/:file", isLoggedIn, UserController.avatar);

module.exports = router;
