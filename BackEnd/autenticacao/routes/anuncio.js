const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const Anuncio = require("../models/Anuncio");
const Role = require("../models/Role");
const {isAuthenticated} = require("../middleware/autheicatorChecker")
const {isServicoEscolar} = require("../middleware/isServicoEscolar")
const {isAluno} = require("../middleware/isAluno");
const Todo = require("../models/ToDo");


router.get("/buscaaluno", isAuthenticated, isAluno, async (req, res) => {
    const query = req.query.query || "";
    const utilizador = req.session.account?.username;

    try {
        const todos = await Todo.find({
            titulo: { $regex: query, $options: "i" },
        });

        return res.json(todos);
    } catch (err) {
        return res.status(500).json({ message: "Erro ao procurar tarefas", err });
    }
});

router.get("/veraluno", isAuthenticated, isAluno, async (req, res) => {

    const email = req.session.account?.username;

    try {
        const aluno = await Aluno.findOne({ email });
        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado." });
        }

        const todos = await Todo.find({
            instituicoes: {
                $elemMatch: {
                    $regex: aluno.escola,
                    $options: "i"
                }
            }
        });

        return res.json(todos);
    } catch (err) {
        console.error("Erro ao procurar tarefas:", err);
        return res.status(500).json({ message: "Erro ao procurar tarefas", err });
    }
});


router.get("/buscaservicoescolar", isAuthenticated, isServicoEscolar, async (req, res) => {
    const query = req.query.query || "";
    const email = req.session.account?.username;

    try {
        const servico = await Role.findOne({ email });

        if (!servico || !servico.tipo) {
            return res.status(403).json({ message: "Tipo de utilizador não encontrado." });
        }

        let filtro = {
            titulo: { $regex: query, $options: "i" }
        };

        switch (servico.tipo) {
            case "Admin":
                // Admin vê tudo (sem mais filtros)
                break;

            case "professor":
                // Coordenador vê só o que criou
                filtro.dono = email;
                break;

            case "servicvo escolar":
                // Secretaria vê os que pertencem à sua instituição
                filtro.instituicoes = {
                    $elemMatch: {
                        $regex: servico.instituicao,
                        $options: "i"
                    }
                };
                break;

            default:
                return res.status(403).json({ message: "Tipo de serviço escolar inválido." });
        }

        const todos = await Todo.find(filtro);
        return res.json(todos);

    } catch (err) {
        console.error("Erro ao procurar tarefas:", err);
        return res.status(500).json({ message: "Erro ao procurar tarefas", err });
    }
});

router.get("/ver",isAuthenticated, isServicoEscolar, async (req, res) => {
    try {


        const email = req.session.account?.username;
        const utilizador = Role.findOne({email: email});

        if (utilizador.role === "professor") {
            const anuncios = Anuncio.find({email: email});
            return res.status(200).json(anuncios);
        } else if (utilizador.role === "entidade escolar") {
            const anuncios = await Anuncio.find({
                instituicao: {
                    $elemMatch: {
                        $regex: utilizador.instituicao,
                        $options: "i" // para ignorar maiúsculas/minúsculas
                    }
                }
            });

            return res.status(200).json(anuncios);
        } else if (utilizador.role === "Admin") {
            const anuncios = Anuncio.find();
            return res.status(200).json(anuncios);
        }
    } catch (error) {
        console.error("Erro ao visualizar Anuncios:", error);
        return res.status(500).json({message: "Erro ao visualizar Anuncios", error});
    }

});

router.post("/inserir",isAuthenticated, isServicoEscolar, async (req, res) => {
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



router.put("/atualizar", isAuthenticated, isServicoEscolar, async (req, res) => {
    try {
        const emailSessao = req.session.account?.username;
        const { id, titulo, descricao, instituicoes } = req.body;
        const data = Date.now();

        if (!id || !titulo || !descricao || !instituicoes) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const utilizador = await Role.findOne({ email: emailSessao });
        if (!utilizador) {
            return res.status(403).json({ message: "Utilizador sem tipo associado." });
        }

        const anuncioOriginal = await Anuncio.findById(id);
        if (!anuncioOriginal) {
            return res.status(404).json({ message: "Anúncio não encontrado." });
        }
        let donoFinal;
        if (utilizador.role === "professor") {
            donoFinal = emailSessao;
        } else {
            donoFinal = anuncioOriginal.dono;
        }
        const resultado = await Anuncio.findByIdAndUpdate(
            id,
            {
                dono: donoFinal,
                titutlo: titulo,
                descricao: descricao,
                instituicao: instituicoes,
                data: data
            },
            { new: true }
        );
        return res.status(200).json({
            message: "Anúncio atualizado com sucesso",
            anuncio: resultado,
        });
    } catch (error) {
        console.error("Erro ao atualizar Anúncio:", error);
        return res.status(500).json({ message: "Erro ao atualizar Anúncio", error });
    }
});



router.post("/apagar",isAuthenticated, isServicoEscolar, async (req, res) => {
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