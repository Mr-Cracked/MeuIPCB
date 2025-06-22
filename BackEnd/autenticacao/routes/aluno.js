const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const {isAuthenticated} = require("../middleware/autheicatorChecker");
const {isAluno} = require("../middleware/isAluno")

//Seleciona um aluno
router.get('/',isAuthenticated, isAluno, async function (req, res){
    try {
        const nome = req.session.account?.name;
        const email = req.session.account?.username;

        console.log("isAuthenticated:", isAuthenticated);



        console.log("Nome do utilizador:", nome);
        console.log("Email:", email);

        const aluno = await Aluno.findOne({ email: email });

        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        res.json(aluno);
    } catch (error) {
        console.error("Erro ao obter dados do utilizador:", error);
        return res.status(500).json({ message: "Erro ao encontrar Aluno", error });
    }
});

router.get("/emails", isAuthenticated, isAluno, async function (req, res) {
  try {
    const alunos = await Aluno.find({}, "nome email");
    const resultado = alunos.map(aluno => ({
      nome: aluno.nome,
      email: aluno.email,
    }));
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao obter emails dos alunos:", err);
    res.status(500).json({ message: "Erro ao obter emails dos alunos", err });
  }
});

router.get('/alunos/email/:email',isAuthenticated , isAluno, async (req, res) => {
    try{

        const email = req.params.email;

        const alunos = await Aluno.find({email: {$regex : email, $options: "i" }});

        if(!alunos.length) {
            return res.status(404).json({message:"Não foram encontrados alunos"})
        }

        return res.json(alunos);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar alunos", err });

    }
});

//pesquisar alunos por nome
router.get('/alunos/nome/:nome',isAuthenticated , isAluno,async (req, res) => {

    try{

        const nome = req.params.nome;

        const alunos = await Aluno.find({nome: {$regex : nome, $options: "i" }});

        if(!alunos.length) {
            return res.status(404).json({message:"Não foram encontrados alunos"})
        }

        return res.json(alunos);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar alunos", err });

    }
});


module.exports = router;