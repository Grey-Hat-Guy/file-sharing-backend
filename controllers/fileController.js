const crypto = require("crypto");
const fs = require("fs");
const File = require("../models/File");

const encryptionKey = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileBuffer = fs.readFileSync(req.file.path);

        const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
        let encryptedData = cipher.update(fileBuffer);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found." });
        }

        const newFile = new File({
            filename: req.file.originalname,
            encryptedData: encryptedData.toString("base64"),
            iv: iv.toString("hex"),
            size: req.file.size,
            uploadedBy: req.user.id,
        });

        await newFile.save();
        res.status(201).json({ message: "File uploaded successfully", file: newFile });
    } catch (error) {
        res.status(500).json({ message: "File upload failed", error: error.message });
    }
}

const getFiles = async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.user.id });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch files!" });
    }
}

module.exports = { uploadFile, getFiles };