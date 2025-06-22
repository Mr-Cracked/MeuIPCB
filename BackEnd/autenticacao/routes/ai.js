const fect = require("node-fetch");
const express = require("express");
const mongoose = require("mongoose");
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const router = express.Router();
const {isAuthenticated} = require("../middleware/autheicatorChecker")
const {isAluno} = require("../middleware/isAluno");

function criarPrompt(pergunta, aluno, horario, professores) {

    return `
Tu és um assistente virtual académico.

Responde com clareza e com base apenas nestes dados.

Baseia-te apenas nestes dados do aluno para responder à pergunta:

Assume o dia da semana e do ano atuais, bem como a hora atual quando respondes às perguntas.

A hora é de Portgual Lisboa.

Informações do aluno: ${JSON.stringify(aluno)}
Horarios do aluno: ${JSON.stringify(horario)}
Professores da instituição: ${JSON.stringify(professores)}

Pergunta: ${pergunta}


`;
}


async function chamarAI(pergunta) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "IPCB-GestorEscolar"
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
                {
                    role: "user",
                    content: pergunta
                }
            ]
        })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content.trim();
}

router.post('/pergunta',isAuthenticated, isAluno,async (req, res, next) => {
    try{

       /*if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
       }*/
        const email = "guilherme.roque@ipcbcampus.pt"//req.session.account.username
        console.log("pergunta", email);
        const aluno = await Aluno.findOne({ email: email });
        console.log(aluno);


        const ano_curricular = aluno.ano_curricular,curso = aluno.curso;
        const horarios = await Turma.find({ ano: ano_curricular, curso: curso, nome: {$in: aluno.turma}});
        const pergunta = req.body.pergunta;
        const professores = await Professor.find({
            Escola: { $elemMatch: { $regex: aluno.instituicao, $options: "i" } }
        });

        console.log("pergunta", pergunta);
        const prompt = criarPrompt(pergunta, horarios, aluno, professores);

        console.log("VOU CHAMAR A AI");
        const resposta = await chamarAI(prompt);
        console.log("CHAMEI A AI");
        res.json({resposta});
    }catch (err) {

    }
})


module.exports = router;