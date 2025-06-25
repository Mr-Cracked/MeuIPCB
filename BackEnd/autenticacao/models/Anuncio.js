const mongoose = require("mongoose");

const AnuncioSchema = new mongoose.Schema({
    dono: { type: String, required: true},
    titulo: { type: String, required: true},
    descricao: { type: String, required: true },
    instituicoes: { type: Array, required: true },
    data: {type: Date, required: true}

}, { collection: "Anuncio" });

const Anuncio = mongoose.models.Anuncio || mongoose.model("Anuncio", AnuncioSchema);
module.exports = Anuncio;
