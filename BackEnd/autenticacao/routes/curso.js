const express = require("express");
const { getGFSBucket } = require('../models/gridfs');
const router = express.Router();
const mongoose = require("mongoose");
const Curso = require("../models/Curso");
const Aluno = require("../models/Aluno");
const Escola = require("../models/Escola");
const {isAuthenticated} = require("../auth/autheicatorChecker")


//Get calensarios de curso consoante a época
router.get('/epoca/:epoca', async (req, res) =>{
    try {

        isAuthenticated

        const epoca = req.params.epoca;

        const aluno = await Aluno.findOne({ email: req.session.account.username });

        const gfs = getGFSBucket();

        const curso = await Curso.findOne({nome: aluno.curso});

        const index = epoca === 'Normal' ? 0: 1;

        const _id = curso.calendarios[index].fileId;

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

module.exports = router;