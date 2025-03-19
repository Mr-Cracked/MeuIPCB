const mongoose = require("mongoose");

const CursoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    calendarios: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files' },
            data_download: { type: Date, default: Date.now }
        }
    ]
}, { collection: "Curso" });

const Curso = mongoose.models.Curso || mongoose.model("Curso", CursoSchema);
module.exports = Curso;
