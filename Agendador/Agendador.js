const database = require("./database/basedados");
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
        let alunos = JSON.parse(fs.readFileSync("Dados.json", "utf-8"));

        // Garantir que os dados são um array
        if (!Array.isArray(alunos)) {
            alunos = [alunos];
        }

        console.log(`📌 ${alunos.length} alunos carregados do JSON`);

        for (let data of alunos) {
            // Verificar se o JSON tem a estrutura correta
            if (!data.perfil || !data.horario || !data.perfil.numero_aluno) {
                console.error("❌ Estrutura inválida, ignorando aluno...");
                continue;
            }

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

            console.log(`📌 Processando aluno: ${AlunoData.nome} (${AlunoData.numero_aluno})`);

            // Verificar se os dados principais estão presentes
            if (!AlunoData.numero_aluno || !AlunoData.nome || !AlunoData.curso || !AlunoData.turma) {
                console.error("❌ Dados principais ausentes, ignorando aluno...");
                continue;
            }

            console.log("📌 Inserindo aluno no MongoDB...");

            // Inserir ou atualizar aluno no MongoDB
            const resultAluno = await Aluno.findOneAndUpdate(
                { numero_aluno: AlunoData.numero_aluno },
                AlunoData,
                { upsert: true, new: true }
            );

            console.log(`✅ Aluno ${AlunoData.nome} inserido/atualizado com sucesso!`);

            // Extrair os dados da turma e horário
            const TurmaData = {
                nome: data.horario.turma_identificadora,
                horario: Array.isArray(data.horario.dias) ? data.horario.dias : []
            };

            console.log(`📌 Processando turma: ${TurmaData.nome}`);

            console.log("📌 Inserindo turma no MongoDB...");

            // Inserir ou atualizar turma no MongoDB
            const resultTurma = await Turma.findOneAndUpdate(
                { nome: TurmaData.nome },
                TurmaData,
                { upsert: true, new: true }
            );

            console.log(`✅ Turma ${TurmaData.nome} inserida/atualizada com sucesso!`);
        }

        console.log("✅ Todos os alunos e turmas foram inseridos/atualizados com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao importar dados:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔹 Conexão encerrada.");
    }
};

// Executar a importação
importData();
