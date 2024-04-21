const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const multer = require("multer");
const upload = multer();
const isLoggedIn = require("../middlewares/checkAuth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/publications/");
  },
  filename: (req, file, cb) => {
    cb(null, "pub-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/save", isLoggedIn, upload.any(), PublicationController.save);
router.get("/get-one/:id", PublicationController.detail);
router.delete("/remove/:id/:page?", isLoggedIn, PublicationController.remove);
router.get("/user/:id/:page?", isLoggedIn, PublicationController.user);
router.post(
  "/upload/:id?",
  [isLoggedIn, uploads.single("file0")],
  PublicationController.upload
);
router.get("/media/:file", isLoggedIn, PublicationController.media);
router.get("/feed/:page?", isLoggedIn, PublicationController.feed);
router.get(
  "/my-publications/:id/:page?",
  isLoggedIn,
  PublicationController.myPublications
);

module.exports = router;
