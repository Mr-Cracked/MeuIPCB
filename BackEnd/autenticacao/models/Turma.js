const mongoose = require("mongoose");

const TurmaSchema = new mongoose.Schema({
    nome: { type: String, required: true},
    curso: { type: String, required: true},
    ano: { type: String, required: true},
    semestre: { type: String, required: true},
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
