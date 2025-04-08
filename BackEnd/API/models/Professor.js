const mongoose = require("mongoose");

const ProfessorSchema = new mongoose.Schema({
    Escola: {type: Array, required: true},
    nome: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true},
}, { collection: "Professor" });

const Professor = mongoose.models.Professor || mongoose.model("Professor", ProfessorSchema);
module.exports = Professor;
