const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const Turma = require("../models/Turma");
const Professor = require("../models/Professor");
const Escola = require("../models/Escola");
const Curso = require("../models/Curso");
const Todo = require("../models/ToDo");
const { isAuthenticated } = require("../auth/autheicatorChecker");

router.post("/inserir", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    const { id, titulo, prazo, descricao, prioridade, concluido } = req.body;
    const data = Date.now();

    if (!dono || !titulo || !prazo) {
      return res.status(400).json({ message: "Campos em falta." });
    }

    const TODO = Todo({
      dono: dono,
      titulo: titulo,
      data_criacao: data,
      prazo: prazo,
      descricao: descricao,
      prioridade: prioridade,
      concluido: concluido,
    });

    const resultado = await TODO.save();
    return res.status(201).json({
      message: "ToDo inserido com sucesso",
      todo: resultado,
    });
  } catch (error) {
    console.error("Erro ao inserir ToDo:", error);
    return res.status(500).json({ message: "Erro ao inserir ToDo", error });
  }
});

router.get("/ver", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    const id = req.body;

    if (!dono || !id) {
      return res.status(400).json({ message: "Campos em falta." });
    }

    const TODO = await Todo.findOne({ id: id });

    if (!TODO) {
      return res.status(404).json({ message: "ToDo não encontrado" });
    }

    return res.json(TODO);
  } catch (error) {
    console.error("Erro ao listar ToDo:", error);
    return res.status(500).json({ message: "Erro ao listar ToDo", error });
  }
});

router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    console.log("DONO:", dono);

    if (!dono) {
      return res.status(400).json({ message: "Campos em falta." });
    }

    const TODO = await Todo.find({ dono: dono, concluido: false });

    if (!TODO) {
      return res.status(404).json({ message: "Não encontrado" });
    }

    return res.json(TODO);
  } catch (error) {
    console.error("Erro ao listar ToDo:", error);
    return res.status(500).json({ message: "Erro ao listar ToDo", error });
  }
});

router.put("/atualizar", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    const { id, titulo, prazo, descricao, prioridade, concluido } = req.body;
    const data = Date.now();

    if (!dono || !id) {
      return res.status(400).json({ message: "Campos em falta." });
    }

    const update = {
      dono,
      titulo,
      data_criacao: data,
      prazo,
      descricao,
      prioridade,
    };

    if (concluido !== undefined) {
      update.concluido = concluido;
    }

    const resultado = await Todo.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!resultado) {
      return res.status(404).json({ message: "ToDo não encontrado." });
    }

    return res.status(200).json({
      message: "ToDo atualizado com sucesso",
      todo: resultado,
    });
  } catch (error) {
    console.error("Erro ao atualizar ToDo:", error);
    return res.status(500).json({ message: "Erro ao atualizar ToDo", error });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID em falta." });
    }

    const resultado = await Todo.findByIdAndDelete(id);

    if (!resultado) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    return res.status(200).json({ message: "Tarefa apagada com sucesso." });
  } catch (error) {
    console.error("Erro ao apagar ToDo:", error);
    return res.status(500).json({ message: "Erro ao apagar ToDo", error });
  }
});

router.get("/velhosdata", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({
      dono: req.session.account?.username,
      concluido: false,
    }).sort({ data_criacao: 1 }); // -1 = descendente, 1 = ascendente
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter Todos", error });
  }
});

router.get("/prazopox", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({
      dono: req.session.account?.username,
      concluido: false,
    }).sort({ prazo: 1 }); // -1 = descendente, 1 = ascendente
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter Todos", error });
  }
});

router.get("/prazolonge", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({
      dono: req.session.account?.username,
      concluido: false,
    }).sort({ prazo: -1 }); // -1 = descendente, 1 = ascendente
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter Todos", error });
  }
});

router.get("/novosdata", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({ dono: req.session.account?.username }).sort(
      { data_criacao: -1 }
    ); // -1 = descendente, 1 = ascendente
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter Todos", error });
  }
});

router.get("/feitos", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({ dono: req.session.account?.username }).sort(
      { concluido: true }
    ); // -1 = descendente, 1 = ascendente
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter Todos", error });
  }
});

router.get("/prioridadealta", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    if (!dono) {
      return res.status(400).json({ message: "Dono não identificado." });
    }

    const todos = await Todo.find({ dono, concluido: false });

    const todosOrdenados = todos.sort((a, b) => b.prioridade - a.prioridade);

    return res.json(todosOrdenados);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao ordenar por prioridade", error });
  }
});

router.get("/prioridadebaixa", isAuthenticated, async (req, res) => {
  try {
    const dono = req.session.account?.username;
    if (!dono) {
      return res.status(400).json({ message: "Dono não identificado." });
    }

    const todos = await Todo.find({ dono, concluido: false });

    const ordemPrioridade = ["Baixa", "Média", "Média-Alta", "Alta"];

    const todosOrdenados = todos.sort((a, b) => {
      return (
        ordemPrioridade.indexOf(a.prioridade) -
        ordemPrioridade.indexOf(b.prioridade)
      );
    });

    return res.json(todosOrdenados);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao ordenar por prioridade", error });
  }
});

router.get("/busca", isAuthenticated, async (req, res) => {
  const query = req.query.query || "";
  const utilizador = req.session.account?.username;

  try {
    const todos = await Todo.find({
      titulo: { $regex: query, $options: "i" },
      dono: utilizador,
    });

    return res.json(todos);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao procurar tarefas", err });
  }
});

module.exports = router;
