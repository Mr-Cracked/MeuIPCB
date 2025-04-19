const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");

// Middleware de autenticação
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // Redireciona para login
    }
    next();
}

// Get Horário do aluno
router.get('/horario', isAuthenticated, async (req, res) => {

    if (!isAuthenticated) {
        return res.status(401).json({ message: "Utilizador não autenticado" });
    }

    try {
        const email = req.session.account?.username;

        if (!email) {
            return res.status(400).json({ message: "Email do utilizador não encontrado na sessão." });
        }

        const aluno = await Aluno.findOne({ email: email });
        console.log(aluno);

        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        const { ano_curricular, curso } = aluno;
        console.log(ano_curricular);
        console.log(curso);

        const horarios = await Turma.find({ ano: ano_curricular, curso: curso, nome: {$in: aluno.turma}});

        if (horarios.length === 0) {
            return res.status(404).json({ message: "Horários não encontrados" });
        }

        res.json(horarios);

    } catch (error) {
        console.error("Erro ao obter horários:", error);
        return res.status(500).json({ message: "Erro ao encontrar horários", error });
    }
});

module.exports = router;
