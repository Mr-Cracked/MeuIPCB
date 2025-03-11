const mongoose = require("mongoose");

const TurmaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    horario: [{
        dia: String,
        aulas: [{
            disciplina: String,
            hora_inicio: String,
            hora_fim: String,
            sala: String,
            turma: String
        }]
    }]
}, { collection: "Turma" });

const Turma = mongoose.model("Turma", TurmaSchema);
module.exports = Turma;
