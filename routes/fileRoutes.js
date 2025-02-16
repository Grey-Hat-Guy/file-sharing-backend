const express = require("express");
const { uploadFile, getFiles } = require("../controllers/fileController");
const upload = require("../midddlewares/uploadMiddleware");
const authMiddleware = require('../midddlewares/authMiddleware');

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/my-files", authMiddleware, getFiles);

module.exports = router;