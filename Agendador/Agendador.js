const database = require("./database/basedados");
const fs = require("fs");
const mongoose = require("mongoose");
const Aluno = require("./models/Aluno");
const Turma = require("./models/Turma");
const { scrapeCalendarios } = require("./scraper");

require("dotenv").config();

const importData = async () => {
    try {
        // Conectar à base de dados
        await database();
        console.log("🔹 Conexão estabelecida. Lendo o JSON...");

        // Ler o JSON
        let jsonData = JSON.parse(fs.readFileSync("Dados.json", "utf-8"));

        // Garantir que os dados são um array
        const alunos = Array.isArray(jsonData.alunos) ? jsonData.alunos : [jsonData.alunos];
        const horarios = Array.isArray(jsonData.horarios) ? jsonData.horarios : [];

        console.log(`📌 ${alunos.length} alunos carregados do JSON`);

        for (let data of alunos) {
            // Verificar se o JSON tem a estrutura correta
            if (!data.perfil || !data.perfil.numero_aluno) {
                console.error("❌ Estrutura inválida, ignorando aluno...");
                continue;
            }

            // Determinar o último ano curricular do aluno
            const ultimoAno = data.percurso_academico.length > 0
                ? data.percurso_academico[data.percurso_academico.length - 1].ano_curricular
                : "N/A";

            // Extrair os dados do aluno
            const AlunoData = {
                numero_aluno: data.perfil.numero_aluno,
                nome: data.perfil.nome,
                email: data.perfil.email,
                curso: data.perfil.curso,
                instituicao: data.perfil.instituicao,
                grau_conferido: data.perfil.grau_conferido,
                situacao: data.perfil.situacao,
                ano_curricular: ultimoAno,
                nota_final: data.perfil.nota_final || "N/A",
                percurso_academico: Array.isArray(data.percurso_academico) ? data.percurso_academico : [],
                totais_por_ano_letivo: data.totais_por_ano_letivo || {},
                plano_de_estudos: data.plano_de_estudos || {},
                turma: data.horario && data.horario.turma_identificadora ? data.horario.turma_identificadora : "N/A"
            };

            console.log(`📌 Processando aluno: ${AlunoData.nome} (${AlunoData.numero_aluno})`);

            // Inserir ou atualizar aluno no MongoDB
            const resultAluno = await Aluno.findOneAndUpdate(
                { numero_aluno: AlunoData.numero_aluno },
                AlunoData,
                { upsert: true, new: true }
            );

            console.log(`✅ Aluno ${AlunoData.nome} inserido/atualizado com sucesso!`);
        }

        // Processar os horários
        for (let horario of horarios) {
            if (!horario.turma || !horario.dias) {
                console.warn("⚠️ Horário sem turma ou dias. Pulando...");
                continue;
            }

            const TurmaData = {
                nome: horario.turma,
                curso: horario.curso,
                ano: horario.ano,
                semestre: horario.semestre,
                horario: Array.isArray(horario.dias) ? horario.dias : []
            };

            console.log(`📌 Processando horário da turma: ${TurmaData.nome}`);

            try {
                // Inserir ou atualizar turma no MongoDB
                const resultTurma = await Turma.findOneAndUpdate(
                    { nome: TurmaData.nome, curso: TurmaData.curso, ano: TurmaData.ano, semestre: TurmaData.semestre },
                    TurmaData,
                    { upsert: true, new: true }
                );

                console.log(`✅ Horário da turma ${TurmaData.nome} inserido/atualizado com sucesso!`);
            } catch (error) {
                console.error(`❌ Erro ao inserir/atualizar horário da turma ${TurmaData.nome}:`, error);
            }

        }

        console.log("✅ Todos os alunos e horários foram inseridos/atualizados com sucesso!");

        // Executar scraping dos calendários das escolas
        await scrapeCalendarios();
        await scrapeCalendarios();
        // console.log("✅ Calendários importados com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao importar dados:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔹 Conexão encerrada.");
    }
};

// Executar a importação
importData();
