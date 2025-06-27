/* routes/anuncio.js */
const express = require("express");
const router = express.Router();

const Aluno     = require("../models/Aluno");
const Anuncio   = require("../models/Anuncio");
const Professor = require("../models/Professor");
const { isAuthenticated }    = require("../middleware/autheicatorChecker");
const { isServicoEscolar }   = require("../middleware/isServicoEscolar");
const { isAluno }            = require("../middleware/isAluno");

/* -------------------------------------------------------- *
 *  ALUNO – pesquisa anúncios da sua escola
 *  GET /anuncio/buscaaluno?query=...
 * -------------------------------------------------------- */
router.get("/buscaaluno", isAuthenticated, isAluno, async (req, res) => {
    const query = req.query.query ?? "";
    const email = req.session.account?.username;

    try {
        const aluno = await Aluno.findOne({ email });
        if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });

        const anuncios = await Anuncio.find({
            instituicoes: { $elemMatch: { $regex: aluno.escola, $options: "i" } },
            titulo:       { $regex: query,       $options: "i" }
        }).sort({ data: -1 });

        res.json(anuncios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao procurar anúncios", err });
    }
});

/* -------------------------------------------------------- *
 *  ALUNO – ver todos anúncios da sua escola
 *  GET /anuncio/veraluno
 * -------------------------------------------------------- */
router.get("/veraluno", isAuthenticated, isAluno, async (req, res) => {
    const email = req.session.account?.username;

    try {
        const aluno = await Aluno.findOne({ email });
        if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });

        const anuncios = await Anuncio.find({
            instituicoes: { $elemMatch: { $regex: aluno.instituicao, $options: "i" } }
        }).sort({ data: -1 });

        res.json(anuncios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao procurar anúncios", err });
    }
});

/* -------------------------------------------------------- *
 *  SERVIÇO ESCOLAR – pesquisa filtrada por role
 *  GET /anuncio/buscaservicoescolar?query=...
 * -------------------------------------------------------- */
router.get("/buscaservicoescolar", isAuthenticated, isServicoEscolar, async (req, res) => {
    const query = req.query.query ?? "";
    const email = req.session.account?.username;

    try {
        // 1 — obter o utilizador e validar role
        const utilizador = await Professor.findOne({ email });
        const role = utilizador?.Role?.trim().toLowerCase();

        if (!role) {
            return res.status(403).json({ message: "Tipo de utilizador não encontrado." });
        }

        // 2 — construir filtro de pesquisa
        const filtro = {
            titulo: { $regex: query, $options: "i" }
        };

        switch (role) {
            case "admin":
                // vê tudo
                break;

            case "professor":
                filtro.dono = email;
                break;

            case "servico escolar":
                filtro.instituicoes = {
                    $elemMatch: { $regex: utilizador.instituicao, $options: "i" }
                };
                break;

            default:
                return res.status(403).json({ message: "Tipo de serviço escolar inválido." });
        }

        // 3 — executar query
        const anuncios = await Anuncio.find(filtro).sort({ data: -1 });
        res.json(anuncios);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao procurar anúncios", err });
    }
});



/* -------------------------------------------------------- *
 *  SERVIÇO ESCOLAR – ver lista completa segundo role
 *  GET /anuncio/ver
 * -------------------------------------------------------- */
router.get("/ver", isAuthenticated, isServicoEscolar, async (req, res) => {
    const email = req.session.account?.username;

    try {
        const utilizador = await Professor.findOne({ email }); // ✅ corrigido aqui
        if (!utilizador?.Role) {
            return res.status(403).json({ message: "Tipo de utilizador não encontrado." });
        }

        let filtro = {};
        switch (utilizador.Role) {
            case "Admin": break;
            case "professor":
                filtro.dono = email;
                break;
            case "servico escolar":
                filtro.instituicoes = {
                    $elemMatch: { $regex: utilizador.instituicao, $options: "i" }
                };
                break;
            default:
                return res.status(403).json({ message: "Tipo de serviço escolar inválido." });
        }

        const anuncios = await Anuncio.find(filtro).sort({ data: -1 });
        res.json(anuncios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao visualizar anúncios", err });
    }
});

/* -------------------------------------------------------- *
 *  SERVIÇO ESCOLAR – cria novo anúncio
 *  POST /anuncio/inserir
 * -------------------------------------------------------- */
router.post("/inserir", isAuthenticated, isServicoEscolar, async (req, res) => {
    const dono = req.session.account?.username;
    const { titulo, descricao, instituicoes } = req.body;

    if (!dono || !titulo || !descricao || !instituicoes?.length)
        return res.status(400).json({ message: "Campos em falta." });

    try {
        const novo = await Anuncio.create({
            dono, titulo, descricao, instituicoes,
            data: Date.now()
        });
        res.status(201).json({ message: "Anúncio inserido com sucesso", anuncio: novo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao inserir anúncio", err });
    }
});

/* -------------------------------------------------------- *
 *  SERVIÇO ESCOLAR – atualizar anúncio
 *  PUT /anuncio/atualizar
 * -------------------------------------------------------- */
router.put("/atualizar/:id", isAuthenticated, isServicoEscolar, async (req, res) => {
    const emailSessao = req.session.account?.username;
    const { titulo, descricao, instituicoes } = req.body;
    const id = req.params.id;

    if (!id || !titulo || !descricao || !instituicoes?.length)
        return res.status(400).json({ message: "Campos em falta." });

    try {
        const utilizador = await Professor.findOne({ email: emailSessao });
        const anuncio    = await Anuncio.findById(id);

        if (!utilizador || !anuncio)
            return res.status(404).json({ message: "Anúncio ou utilizador não encontrado." });

        /* ——— permissões ——— */
        if (utilizador.Role === "professor" && anuncio.dono !== emailSessao)
            return res.status(403).json({ message: "Sem permissão para editar este anúncio." });

        if (
            utilizador.Role === "servico escolar" &&
            !anuncio.instituicoes.some(inst =>
                new RegExp(utilizador.instituicao, "i").test(inst)
            )
        )
            return res.status(403).json({ message: "Sem permissão para editar este anúncio." });

        const atualizado = await Anuncio.findByIdAndUpdate(
            id,
            { titulo, descricao, instituicoes, data: Date.now() },
            { new: true }
        );
        res.json({ message: "Anúncio atualizado com sucesso", anuncio: atualizado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar anúncio", err });
    }
});

/* -------------------------------------------------------- *
 *  SERVIÇO ESCOLAR – apagar anúncio
 *  DELETE /anuncio/apagar/:id
 * -------------------------------------------------------- */
router.delete("/apagar/:id", isAuthenticated, isServicoEscolar, async (req, res) => {
    const emailSessao = req.session.account?.username;
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Sem ID." });

    try {
        const utilizador = await Professor.findOne({ email: emailSessao });
        const anuncio    = await Anuncio.findById(id);

        if (!utilizador || !anuncio)
            return res.status(404).json({ message: "Anúncio ou utilizador não encontrado." });

        /* ——— permissões ——— */
        if (utilizador.Role === "professor" && anuncio.dono !== emailSessao)
            return res.status(403).json({ message: "Sem permissão para apagar este anúncio." });

        if (
            utilizador.Role === "servico escolar" &&
            !anuncio.instituicoes.some(inst =>
                new RegExp(utilizador.instituicao, "i").test(inst)
            )
        )
            return res.status(403).json({ message: "Sem permissão para apagar este anúncio." });

        await Anuncio.findByIdAndDelete(id);
        res.json({ message: "Anúncio apagado com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao apagar anúncio", err });
    }
});

module.exports = router;
