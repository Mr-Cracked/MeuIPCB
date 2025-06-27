const mongoose = require("mongoose");

const EscolaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    calendarios: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files' },
            data_download: { type: Date, default: Date.now }
        }
    ],
    horariosSalas: [
        {
            sala: { type: String, required: true },
            horario: [
                {
                    dia: { type: String, required: true },
                    aulas: [
                        {
                            disciplina: { type: String, required: true },
                            hora_inicio: { type: String, required: true },
                            hora_fim: { type: String, required: true },
                            turma: { type: String, required: true }
                        }
                    ]
                }
            ]
        }
    ]
}, { collection: "Escola" });

const Escola = mongoose.models.Escola || mongoose.model("Escola", EscolaSchema);
module.exports = Escola;
