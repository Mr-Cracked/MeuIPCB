const mongoose = require("mongoose");

const EscolaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    calendarios: [
        {
            nome: String,    // Nome do ficheiro
            data_download: { type: Date, default: Date.now }
        }
    ]
}, { collection: "Escola" });

const Escola = mongoose.model("Escola", EscolaSchema);
module.exports = Escola;
