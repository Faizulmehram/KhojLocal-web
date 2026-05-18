const express = require("express");
const multer = require("multer");

const { verifyCnicController } = require("../controllers/verifyCnicController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }

    return cb(null, true);
  },
});

router.post("/verify-cnic", upload.single("image"), verifyCnicController);

module.exports = router;
