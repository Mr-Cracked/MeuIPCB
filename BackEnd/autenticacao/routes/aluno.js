const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

//Seleciona um aluno
router.get('/', async function (req, res){
    console.log(req.user);
    try {
        const nome = req.session.account.name;
        const email = req.session.account.username;

        console.log("isAuthenticated:", isAuthenticated);

        if (!isAuthenticated) {
            return res.status(401).json({ message: "Utilizador não autenticado" });
        }

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


module.exports = router;