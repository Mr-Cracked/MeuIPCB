const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const Todo = require("../models/ToDo");
const {isAuthenticated} = require("../auth/autheicatorChecker")



router.post("/inserir",isAuthenticated , async (req, res) => {
   try{

       const dono = req.session.account?.name;
       const { nome, prazo, descricao, prioridade } = req.body;
       const data = Date.now();


       if (!dono || !nome || !prazo || !descricao) {
           return res.status(400).json({ message: "Campos em falta." });
       }

       const TODO = Todo({
           dono: dono,
           nome: nome,
           data: data,
           prazo: prazo,
           descricao: descricao,
           prioridade: prioridade,
       });

       const resultado = await TODO.save();
       return res.status(201).json({
           message: "ToDo inserido com sucesso",
           todo: resultado,
       });
   }catch (error) {
       console.error("Erro ao inserir ToDo:", error);
       return res.status(500).json({ message: "Erro ao inserir ToDo", error });
   }
});

router.get("/ver",isAuthenticated , async (req, res) => {
    try{

        const dono = req.session.account?.name;
        const id  = req.body;


        if (!dono || !id) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const TODO = Todo.findOne({id : id});

        if (!TODO) {
            return res.status(404).json({ message: "ToDo não encontrado" });
        }

        res.json(TODO);
    }catch (error) {
        console.error("Erro ao listar ToDo:", error);
        return res.status(500).json({ message: "Erro ao listar ToDo", error });
    }
});

router.get("/all",isAuthenticated , async (req, res) => {
    try{


        const dono = req.session.account?.name;


        if (!dono) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const TODO = Todo.find({dono: dono});

        if (!TODO) {
            return res.status(404).json({ message: "Não encontrado" });
        }

        res.json(TODO);
    }catch (error) {
        console.error("Erro ao listar ToDo:", error);
        return res.status(500).json({ message: "Erro ao listar ToDo", error });
    }
});

router.put("/atualizar",isAuthenticated , async (req, res) => {
    try{

        const dono = req.session.account?.name;
        const { id, nome, prazo, descricao, prioridade } = req.body;
        const data = Date.now();


        if (!dono || !nome || !prazo || !descricao) {
            return res.status(400).json({ message: "Campos em falta." });
        }

        const TODO = {
            dono: dono,
            nome: nome,
            data: data,
            prazo: prazo,
            descricao: descricao,
            prioridade: prioridade,
        };

        const resultado = await Todo.findOneAndUpdate(
            {id:id},
            TODO,
            { upsert: true, new: true }
        );
        return res.status(201).json({
            message: "ToDo inserido com sucesso",
            todo: resultado,
        });
    }catch (error) {
        console.error("Erro ao atualizar ToDo:", error);
        return res.status(500).json({ message: "Erro ao atualizar ToDo", error });
    }
});

router.post("/apagar",isAuthenticated, async (req, res) => {
    try{
        const id= req.body;


        if (!id) {
            return res.status(400).json({ message: "Sem ID." });
        }

        const resultado = await Todo.delete(
            {id:id},
            { upsert: true, new: true }
        );
        return res.status(201).json({
            message: "ToDo apagado com sucesso",
            todo: resultado,
        });
    }catch (error) {
        console.error("Erro ao apagado ToDo:", error);
        return res.status(500).json({ message: "Erro ao apagado ToDo", error });
    }
});

router.get('/velhosdata',isAuthenticated, async (req, res) => {
    try {
        const todos = await Todo.find({ dono: req.session.account?.name }).sort({ data_criacao: -1 }); // -1 = descendente, 1 = ascendente
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter Todos', error });
    }
});

router.get('/novosdata',isAuthenticated, async (req, res) => {
    try {
        const todos = await Todo.find().sort({ data_criacao: 1 }); // -1 = descendente, 1 = ascendente
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter Todos', error });
    }
});

router.get('/busca',isAuthenticated, async (req, res) => {
    const query = req.query.query || '';
    const utilizador = req.session.account?.name

    try {
        const todos = await ToDo.find({
            titulo: { $regex: query, $options: 'i' }, // case-insensitive
            dono: utilizador // garantir que são só do utilizador
        });

        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao procurar tarefas', err });
    }
});

module.exports = router;