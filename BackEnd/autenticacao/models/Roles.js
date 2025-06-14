const mongoose = require("mongoose");

const RolesSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true },
    role: { type: String, required: true},
}, { collection: "Roles" });

const Roles = mongoose.models.Roles || mongoose.model("Roles", RolesSchema);
module.exports = Roles;
