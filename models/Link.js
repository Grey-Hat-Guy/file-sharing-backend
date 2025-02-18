const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
    token: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expires in 1 hour
});

module.exports = mongoose.model("Link", linkSchema);