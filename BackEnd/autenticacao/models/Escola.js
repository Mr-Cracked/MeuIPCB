const mongoose = require("mongoose");

const EscolaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    calendarios: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files' },
            data_download: { type: Date, default: Date.now }
        }
    ]
}, { collection: "Escola" });

const Escola = mongoose.models.Escola || mongoose.model("Escola", EscolaSchema);
module.exports = Escola;
