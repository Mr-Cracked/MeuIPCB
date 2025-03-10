const mongoose = require("mongoose");

const AlunoSchema = new mongoose.Schema({
    perfil: {
        instituicao: String,
        numero_aluno: String,
        nome: String,
        curso: String,
        grau_conferido: String,
        situacao: String,
    },
    percurso_academico: [
        {
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
        }
    ],
    totais_por_ano_letivo: Object,  // Para armazenar as estatísticas por ano
    plano_de_estudos: Object,  // Para manter a estrutura dos anos e disciplinas
    /*horario: {
        turma_identificadora: String,
        dias: [
            {
                dia: String,
                aulas: [
                    {
                        disciplina: String,
                        hora_inicio: String,
                        hora_fim: String,
                        sala: String,
                        turma: String
                    }
                ]
            }
        ]
    }*/
});

const Aluno = mongoose.model("Aluno", AlunoSchema);
module.exports = Aluno;

