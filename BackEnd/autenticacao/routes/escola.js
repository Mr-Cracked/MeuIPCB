const express = require("express");
const { getGFSBucket } = require('../models/gridfs');
const router = express.Router();
const mongoose = require("mongoose");
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const {isAuthenticated} = require("../middleware/autheicatorChecker")
const {isAluno} = require("../middleware/isAluno");


//Get calendário escola da escola do aluno
router.get('/',isAuthenticated, isAluno, async (req, res) => {
    try {


        const aluno = await Aluno.findOne({ email: req.session.account.username });
        console.log(aluno.instituicao);
        const gfs = getGFSBucket();
        const escola = await Escola.findOne({nome: aluno.instituicao});
        console.log("escola", escola.nome);
        const _id = escola.calendarios[0].fileId
        const file = await gfs.find({ _id }).toArray();

        if (!file || file.length === 0) {
            return res.status(404).json({ error: 'Ficheiro não encontrado' });
        }

        res.set('Content-Type', 'application/pdf');

        const readStream = gfs.openDownloadStream(_id);
        readStream.pipe(res);

    } catch (err) {
        console.error('❌ Erro ao carregar PDF:', err.message);
        res.status(500).json({ error: 'Erro ao carregar PDF' });
    }
});

router.get("/horariosSalas",isAuthenticated, isAluno, async (req, res) => {
    try {
        const aluno = await Aluno.findOne({ email: req.session.account.username });
        const escola = await Escola.findOne({ nome:aluno.instituicao })
            .select("nome horariosSalas -_id")
            .lean();

        if (!escola) {
            return res.status(404).json({ erro: "Escola não encontrada" });
        }

        return res.json(escola);                 // devolve {nome, horariosSalas}
    } catch (err) {
        console.error("Erro a obter horários:", err);
        return res.status(500).json({ erro: "Falha no servidor" });
    }
});

module.exports = router;