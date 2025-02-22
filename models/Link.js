const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
    token: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiry: { type: Date, required: true },
    password: { type: String, default: null },
});

module.exports = mongoose.model("Link", linkSchema);