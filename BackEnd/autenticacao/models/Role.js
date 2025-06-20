const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    instituicap:{ type: String, required: true },
    Role: { type: String, required: true}
}, { collection: "Anuncio" });

const Anuncio = mongoose.models.Role || mongoose.model("Role", RoleSchema);
module.exports = Anuncio;
