const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

//Seleciona um aluno
router.get('/', async function (req, res){
    try {

        if (!isAuthenticated) {
            return res.status(401).json({ message: "Utilizador não autenticado" });
        }

        const nome = req.session.account.name;
        const email = req.session.account.username;

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

router.get('/professores', async (req, res) => {
    try{

        if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }

        const aluno = await Aluno.findOne({ email: req.session.account.username });




        const professores = await Professor.find({escola: aluno.escola});

        if(!professores.length) {
            return res.status(404).json({message:"Não foram encontrados professores"})
        }

        res.json(professores);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar Professores", err });

    }
});

router.get('/professores/email/:email', async (req, res) => {
    try{

        if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }

        const email = req.params.email;


        const professores = await Professor.find({email: {$regex : email, $options: "i" }});

        if(!professores.length) {
            return res.status(404).json({message:"Não foram encontrados professores"})
        }

        res.json(professores);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar Professores", err });

    }
});

router.get('/professores/nome/:nome', async (req, res) => {
    try{

        if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }

        const nome = req.params.nome;


        const professores = await Professor.find({nome: {$regex : nome, $options: "i" }});

        if(!professores.length) {
            return res.status(404).json({message:"Não foram encontrados professores"})
        }

        res.json(professores);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar Professores", err });

    }
});

router.get('/professores/:email/:nome/:escola', async (req, res) => {
    try{

        if(!isAuthenticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }

        const email = req.params.email;
        const nome = req.params.nome;
        const escola = req.params.escola;


        const professores = await Professor.find({
            email: {$regex : email, $options: "i" },
            nome: {$regex : nome, $options: "i"},
            escola: {$regex : escola, $options: "i"},});

        if(!professores.length) {
            return res.status(404).json({message:"Não foram encontrados professores"})
        }

        res.json(professores);
    }catch(err){
        console.error("OLHA O ERRO ", err);
        return res.status(500).json({ message: "Erro ao encontrar Professores", err });

    }
});


module.exports = router;