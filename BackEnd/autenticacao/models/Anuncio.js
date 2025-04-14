const mongoose = require("mongoose");

const AnuncioSchema = new mongoose.Schema({
    dono: { type: String, required: true, unique: true },
    titulo: { type: String, required: true},
    descricao: { type: String, required: true },
    imagem:[
    {
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files' }
    }
]

}, { collection: "Anuncio" });

const Anuncio = mongoose.models.Anuncio || mongoose.model("Anuncio", AnuncioSchema);
module.exports = Anuncio;
