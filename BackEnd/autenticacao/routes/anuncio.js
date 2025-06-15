const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const Anuncio = require("../models/Anuncio");
const Roles = require("../models/Roles");
const {isAuthenticated} = require("../auth/autheicatorChecker")



router.get("/ver",isAuthenticated, (req, res) => {
    try{


        const email = req.session.account?.username;
        const role = Roles.findOne({ email: email }).role;

        if (role === "Normal"){
            const anuncios = Anuncio.find({email: email});
            res.status(200).json(anuncios);
        }else{
            const anuncios = Anuncio.find();
            res.status(200).json(anuncios);
        }
    }catch (error) {
        console.error("Erro ao visualizar Anuncios:", error);
        return res.status(500).json({ message: "Erro ao visualizar Anuncios", error });
    }

});

router.post("/inserir",isAuthenticated, async (req, res) => {
    try{

        const dono = req.session.account?.username;
        const {titulo,descricao, instituicoes } = req.body;
        const data = Date.now();

        if (!dono || !titulo || !descricao || !instituicoes) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const anuncio = Anuncio({
            dono: dono,
            titulo: titulo,
            data: data,
            descricao: descricao,
            instituicoes: instituicoes,
        });

        const resultado = await anuncio.save();
        return res.status(201).json({
            message: "Anuncio inserido com sucesso",
            anuncio: resultado,
        });
    }catch (error) {
        console.error("Erro ao inserir Anuncio:", error);
        return res.status(500).json({ message: "Erro ao inserir Anuncio", error });
    }
});



router.put("/atualizar",isAuthenticated, async (req, res) => {
    try{
        const dono = req.session.account?.username;
        const { id,titulo,descricao, instituicoes } = req.body;
        const data = Date.now();

        if (!dono || !titulo || !descricao || !instituicoes) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const anuncio = Anuncio({
            dono: dono,
            titulo: titulo,
            data: data,
            descricao: descricao,
            instituicoes: instituicoes,
        });

        const resultado = await Anuncio.findOneAndUpdate(
            {id:id},
            anuncio,
            { upsert: true, new: true }
        );
        return res.status(201).json({
            message: "Anuncio inserido com sucesso",
            anuncio: resultado,
        });


    }catch (error) {
        console.error("Erro ao atualizar Anuncio:", error);
        return res.status(500).json({ message: "Erro ao atualizar Anuncio", error });
    }
});


router.post("/apagar",isAuthenticated, async (req, res) => {
    try{
        const {id}= req.body;

        if (!id) {
            return res.status(400).json({ message: "Sem ID." });
        }

        const resultado = await Anuncio.delete(
            {id:id},
            { upsert: true, new: true }
        );
        return res.status(201).json({
            message: "Anuncio apagado com sucesso",
            anuncio: resultado,
        });
    }catch (error) {
        console.error("Erro ao apagar Anuncio:", error);
        return res.status(500).json({ message: "Erro ao apagar Anuncio", error });
    }
});


module.exports = router;