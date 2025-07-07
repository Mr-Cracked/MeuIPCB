const cron = require("node-cron");
const database = require("./database/basedados");
const fs = require("fs");
const mongoose = require("mongoose");
const Aluno = require("./models/Aluno");
const Turma = require("./models/Turma");
const Professor = require("./models/Professor");
const Escola = require("./models/Escola");
const { scrapeCalendariosEscolas } = require("./scraperEscolas");
const { scrapeCalendariosCursos } = require("./scraperCursos");

require("dotenv").config();

const importData = async () => {
    try {
        await database();
        console.log("🔹 Conexão estabelecida. Lendo o JSON...");

        let jsonData = JSON.parse(fs.readFileSync("Dados.json", "utf-8"));
        let jsonDataSalas = JSON.parse(fs.readFileSync("horarios_salas_EST.json", "utf-8"));

        const alunos = jsonData.alunos;
        const horarios = jsonData.horarios;
        const professores = jsonData.professores;
        const horariosSalasEST = jsonDataSalas.salas_EST;

        console.log(`📌 ${alunos.length} alunos carregados do JSON`);

        for (let data of alunos) {
            if (!data.perfil || !data.perfil.numero_aluno) {
                console.error("❌ Estrutura inválida, ignorando aluno...");
                continue;
            }

            const turmas = [];
            const plano = data.plano_de_estudos;
            const anos = Object.keys(plano);
            const ultimoAno = anos[anos.length - 1];
            const disciplinasUltimoAno = plano[ultimoAno];

            for (let disciplina of disciplinasUltimoAno) {
                if (disciplina.turma && !turmas.includes(disciplina.turma)) {
                    turmas.push(disciplina.turma);
                }
            }

            const AlunoData = {
                numero_aluno: data.perfil.numero_aluno,
                nome: data.perfil.nome,
                email: data.perfil.email,
                curso: data.perfil.curso,
                instituicao: data.perfil.instituicao,
                grau_conferido: data.perfil.grau_conferido,
                situacao: data.perfil.situacao,
                ano_curricular: ultimoAno.slice(0, 2),
                nota_final: data.perfil.nota_final || "N/A",
                percurso_academico: Array.isArray(data.percurso_academico) ? data.percurso_academico : [],
                totais_por_ano_letivo: data.totais_por_ano_letivo || {},
                plano_de_estudos: data.plano_de_estudos || {},
                turma: turmas,
            };

            await Aluno.findOneAndUpdate(
                { numero_aluno: AlunoData.numero_aluno },
                AlunoData,
                { upsert: true, new: true }
            );
            console.log(`✅ Aluno ${AlunoData.nome} inserido/atualizado com sucesso!`);
        }

        for (let horario of horarios) {
            if (!horario.turma || !horario.dias) {
                console.warn("⚠️ Horário sem turma ou dias. Ignorando...");
                continue;
            }

            const TurmaData = {
                nome: horario.turma,
                curso: horario.curso,
                ano: horario.ano,
                semestre: horario.semestre,
                horario: Array.isArray(horario.dias) ? horario.dias : []
            };

            try {
                await Turma.findOneAndUpdate(
                    { nome: TurmaData.nome, curso: TurmaData.curso, ano: TurmaData.ano, semestre: TurmaData.semestre },
                    TurmaData,
                    { upsert: true, new: true }
                );
                console.log(`✅ Horário da turma ${TurmaData.nome} inserido/atualizado com sucesso!`);
            } catch (error) {
                console.error(`❌ Erro ao inserir/atualizar horário da turma ${TurmaData.nome}:`, error);
            }
        }

        await scrapeCalendariosEscolas();
        console.log("✅ Calendários escolares importados com sucesso!");

        await scrapeCalendariosCursos();
        console.log("✅ Calendários dos cursos importados com sucesso!");

        for (let professor of professores) {
            if (!professor.escolas || !professor.email) {
                console.error("❌ Estrutura inválida, ignorando Professor...");
                continue;
            }

            const ProfessorData = {
                Escola: professor.escolas,
                nome: professor.nome,
                email: professor.email,
                Role: professor.Role
            };

            await Professor.findOneAndUpdate(
                { email: ProfessorData.email },
                ProfessorData,
                { upsert: true, new: true }
            );
            console.log(`✅ Professor ${ProfessorData.nome} inserido/atualizado com sucesso!`);
        }

        const SalasEST = [];
        for (const key in jsonDataSalas) {
            if (key === "salas_EST" && Array.isArray(jsonDataSalas[key])) {
                SalasEST.push(...jsonDataSalas[key]);
            } else if (typeof jsonDataSalas[key] === "object") {
                SalasEST.push({
                    sala: key,
                    horario: jsonDataSalas[key]
                });
            }
        }

        await Escola.updateOne(
            { nome: "Escola Superior de Tecnologia de Castelo Branco" },
            { $set: { horariosSalas: SalasEST } },
            { upsert: true }
        );

        console.log("✅ Horários das salas da ESTCB inseridos/atualizados com sucesso!");
    } catch (error) {
        console.error("❌ Erro a importar dados:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔹 Conexão encerrada.");
    }
};

//Executar de imediato na primeira vez
importData();

//Agendado para correr de 7 em 7 dias às 04:00 da manhã
cron.schedule("0 4 */7 * *", () => {
    console.log("⏰ Agendamento automático iniciado (de 7 em 7 dias)");
    importData();
});
