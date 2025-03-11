const database = require('./database/basedados');
const fs = require("fs");
const mongoose = require("mongoose");
const Aluno = require("./models/Aluno");
const Turma = require("./models/Turma");

require("dotenv").config();

const importData = async () => {
    try {
        await database(); // Conectar à base de dados

        console.log("🔹 Conexão estabelecida. Lendo o JSON...");

        // Ler o JSON
        let data = JSON.parse(fs.readFileSync("Dados.json", "utf-8"));

        console.log("📌 JSON carregado com sucesso!");

        // Extrair os dados do aluno
        const AlunoData = {
            numero_aluno: data.perfil.numero_aluno,
            nome: data.perfil.nome,
            curso: data.perfil.curso,
            instituicao: data.perfil.instituicao,
            grau_conferido: data.perfil.grau_conferido,
            situacao: data.perfil.situacao,
            nota_final: data.perfil.nota_final || "N/A",
            percurso_academico: Array.isArray(data.percurso_academico) ? data.percurso_academico : [],
            totais_por_ano_letivo: data.totais_por_ano_letivo || {},
            plano_de_estudos: data.plano_de_estudos || {},
            turma: data.horario.turma_identificadora // Relacionar aluno com a turma
        };

        console.log("📌 Dados do aluno extraídos:", AlunoData);

        // Verificar se os dados essenciais estão presentes
        if (!AlunoData.numero_aluno || !AlunoData.nome || !AlunoData.curso || !AlunoData.turma) {
            console.error("❌ Erro: Dados principais ausentes. Inserção cancelada.");
            mongoose.connection.close();
            return;
        }

        console.log("📌 Inserindo aluno no MongoDB...");

        // Inserir ou atualizar aluno no MongoDB
        const resultAluno = await Aluno.findOneAndUpdate(
            { numero_aluno: AlunoData.numero_aluno },
            AlunoData,
            { upsert: true, new: true }
        );

        console.log("✅ Dados do aluno inseridos com sucesso!", resultAluno);

        // Extrair os dados da turma e horário
        const TurmaData = {
            nome: data.horario.turma_identificadora,
            horario: Array.isArray(data.horario.dias) ? data.horario.dias : []
        };

        console.log("📌 Dados da turma extraídos:", TurmaData);

        console.log("📌 Inserindo turma no MongoDB...");

        // Inserir ou atualizar turma no MongoDB
        const resultTurma = await Turma.findOneAndUpdate(
            { nome: TurmaData.nome },
            TurmaData,
            { upsert: true, new: true }
        );

        console.log("✅ Dados da turma inseridos com sucesso!", resultTurma);

    } catch (error) {
        console.error("❌ Erro ao importar dados:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔹 Conexão encerrada.");
    }
};

// Executar a importação
importData();
