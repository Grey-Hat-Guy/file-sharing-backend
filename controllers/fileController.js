const crypto = require("crypto");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const File = require("../models/File");
const Link = require("../models/Link");

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

const checkFileInfo = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const link = await Link.findOne({ token });
        if (!link) {
            return res.status(404).json({ message: "Invalid or expired link" });
        }

        if (Date.now() > link.expiry) {
            return res.status(410).json({ message: "Link has expired" });
        }

        const file = await File.findById(decoded.fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.json({ passwordProtected: !!link.password });
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

const generateLink = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { password, expiry } = req.body;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        let existingLink = await Link.findOne({ fileId: file._id, createdBy: req.user.id });

        const payload = { fileId: file._id };
        let hashedPassword = null;

        if (password) {
            hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
            payload.password = hashedPassword;
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (existingLink) {
            existingLink.token = token;
            existingLink.expiry = Date.now() + (expiry ? expiry * 60000 : 3600000);
            existingLink.password = hashedPassword;
            await existingLink.save();
        } else {
            existingLink = new Link({
                fileId: file._id,
                token: token,
                createdBy: req.user.id,
                expiry: Date.now() + (expiry ? expiry * 60000 : 3600000),
                password: hashedPassword
            });

            await existingLink.save();
        }

        const downloadUrl = `${process.env.FRONTEND_URL}/download/${existingLink.token}`;
        res.json({ message: "Link generated successfully", url: downloadUrl });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate link", error: error.message });
    }
};

const decryptFile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        const { token } = req.params;
        const { password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const fileLink = await Link.findOne({ token });
        if (!fileLink) {
            return res.status(404).json({ message: "Invalid or expired link" });
        }

        if (fileLink.password) {
            if (!password) {
                return res.status(400).json({ message: "Password is required to download this file" });
            }
            const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
            if (hashedPassword !== fileLink.password) {
                return res.status(401).json({ message: "Invalid password" });
            }
        }

        const file = await File.findById(decoded.fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(file.iv, "hex"));
        let decryptedData = decipher.update(Buffer.from(file.encryptedData, "base64"));
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);

        res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.send(decryptedData);

    } catch (error) {
        res.status(401).json({ message: "Invalid or expired link!" });
    }
};

module.exports = { uploadFile, getFiles, checkFileInfo, generateLink, decryptFile };