const fect = require("node-fetch");
const express = require("express");
const mongoose = require("mongoose");
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const router = express.Router();
const {isAuthenticated} = require("../auth/autheicatorChecker")

function criarPrompt(pergunta, aluno, horario) {

    return `
Tu és um assistente virtual académico.

Baseia-te apenas nestes dados do aluno para responder à pergunta:

Informações do aluno: ${JSON.stringify(aluno)}
Horarios do aluno: ${JSON.stringify(horario)}

Pergunta: ${pergunta}

Responde com clareza e com base apenas nestes dados.
`;
}


async function chamarAI(pergunta) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", // ou o domínio do teu projeto
            "X-Title": "IPCB-GestorEscolar"
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free", // ou outro modelo
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

router.post('/pergunta',async (req, res, next) => {
    try{

       /* if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }*/
        //const email = req.session.account.username

        const aluno = await Aluno.find({ email: "guilherme.roque@ipcbcampus.pt" });
        console.log(aluno);


        const { ano_curricular, curso } = aluno;
        console.log(ano_curricular);
        console.log(curso);
        const horarios = await Turma.find({ ano: ano_curricular, curso: curso, nome: {$in: aluno.turma}});
        console.log(horarios);
        const pergunta = req.params.pergunta || "calcula a minha média";
        console.log(pergunta);

        console.log("pergunta", pergunta);
        const prompt = criarPrompt(pergunta, horarios, aluno);

        console.log("VOU CHAMAR A AI");
        const resposta = await chamarAI(prompt);
        console.log("CHAMEI A AI");
        res.json({resposta});
    }catch (err) {

    }


})


module.exports = router;