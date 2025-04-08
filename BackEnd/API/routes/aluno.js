const express = require("express");
const router = express.Router();
const api = require('../api.js');
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");

const userData = api.getUserProfile();
const isAutheticated = api.isAuthenticated();

//Seleciona um aluno
router.get('/', async (req, res) => {
    try {
        const userData = await api.getUserProfile();  // Espera a Promise resolver
        const isAuthenticated = await api.isAuthenticated(); // Garante que a autenticação foi verificada

        console.log("User Data:", userData);
        console.log("isAuthenticated:", isAuthenticated);

        if (!isAuthenticated) {
            return res.status(401).json({ message: "Utilizador não autenticado" });
        }

        console.log("Email do utilizador:", userData?.email);
        console.log("Preferred Username:", userData?.idTokenClaims?.preferred_username);

        const aluno = await Aluno.findOne({ email: userData.email });

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
        const userData = await api.getUserProfile();
        const isAuthenticated = await api.isAuthenticated();

        if(!isAutheticated) {
            return res.status(401).json({message:"Utilizador não autenticado"})
        }

        const professores = await Professor.findAll({escola: user.escola});

        if(!professores.length) {
            return res.status(404).json({message:"Não foram encontrados professores"})
        }
    }catch(err){
        return res.status(500).json({ message: "Erro ao encontrar Professores", err });
    }
})


module.exports = router;