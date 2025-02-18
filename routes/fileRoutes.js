const express = require("express");
const { uploadFile, getFiles, generateLink, decryptFile } = require("../controllers/fileController");
const upload = require("../midddlewares/uploadMiddleware");
const authMiddleware = require('../midddlewares/authMiddleware');

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/my-files", authMiddleware, getFiles);
router.post("/generate-link/:fileId", authMiddleware, generateLink);
router.get("/download/:token", authMiddleware, decryptFile);

module.exports = router;