const express = require("express");
const router = express.Router();
const api = require('../api.js');
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");

const userData = api.getUserProfile();
const isAutheticated = api.isAuthenticated();

//TODO caso se torne o caso fazer com que devolva todos os horarios do aluno
//Get Horario do aluno
router.get('/horario', (req, res) => {
    if (isAutheticated) {
        try {
            const ano_curricular = Aluno.findOne({email: userData.email || user.idTokenClaims?.preferred_username},
                {ano_curricular: 1});
            const curso = Aluno.findOne({email: userData.email || user.idTokenClaims?.preferred_username},
                {curso: 1});
            const horarios = Turma.find({ano: ano_curricular},{curso: curso});

            if(!horarios){
                return res.status(404).json({message:"Aluno não encontrado"});
            }
            res.json(horarios);
        }catch (error) {
            return res.status(404).json({message:"What u look for does not exist"});
        }
    }
})

module.exports = router;