const mongoose = require("mongoose");

const AlunoSchema = new mongoose.Schema({
    numero_aluno: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    email: { type: String, required: true },
    curso: { type: String, required: true },
    instituicao: { type: String, required: true },
    grau_conferido: { type: String, required: true },
    situacao: { type: String, required: true },
    nota_final: { type: String, default: "N/A" },
    percurso_academico: [{
        ano_letivo: String,
        plano_estudos: String,
        ramo: String,
        ano_curricular: Number,
        data_inscricao: String,
        ciclo: String,
        regime_estudo: String,
        regime_frequencia: String,
        regime_aluno: String,
        em_mobilidade: String,
        tipo_aluno: String,
        situacao_aluno: String
    }],
    totais_por_ano_letivo: Object, // Mantemos os totais de ECTS e UCs
    plano_de_estudos: Object, // Estruturado por anos
    turma: { type: String, required: true } // Nome da turma associada
}, { collection: "Aluno" });

const Aluno = mongoose.model("Aluno", AlunoSchema);
module.exports = Aluno;
