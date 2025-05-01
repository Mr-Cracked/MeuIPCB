const express = require("express");
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const router = express.Router();
const {isAuthenticated} = require("../auth/autheicatorChecker")


//pesquisar professores da escola do aluno
router.get('/professores', async (req, res) => {
    try{

        isAuthenticated;

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

//pesquisar professores por email
router.get('/professores/email/:email', async (req, res) => {
    try{

        isAuthenticated;

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

//pesquisar professores por nome
router.get('/professores/nome/:nome', async (req, res) => {
    isAuthenticated;
    //console.log(isAuthenticated(), req.session.isAuthenticated);
    try{


        console.log("OLAAA", req.session.isAuthenticated);
        console.log("OLAAA2", req.session);
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


//pesquisar professores por email, nome e escola
router.get('/professores/:email/:nome/:escola', async (req, res) => {
    try{

        isAuthenticated;

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