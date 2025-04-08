const mongoose = require("mongoose");

const CursoSchema = new mongoose.Schema({
    Escola: String,
    nome: { type: String, required: true, unique: true },
    calendarios: [
        {
            epoca: String,
            fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files' },
            data_download: { type: Date, default: Date.now }
        }
    ]
}, { collection: "Curso" });

const Curso = mongoose.models.Curso || mongoose.model("Curso", CursoSchema);
module.exports = Curso;
